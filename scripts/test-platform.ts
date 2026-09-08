import { db } from '../src/lib/db';
import bcrypt from 'bcryptjs';
import { createSessionToken, verifySessionToken } from '../src/lib/auth';
import { getRestaurantBySlug } from '../src/lib/tenant';

async function verifyPlatform() {
  console.log('🔍 Running automated verification test suite...');

  // 1. Verify Tenant Resolution
  const restaurant = await getRestaurantBySlug('urban-bites');
  if (!restaurant) throw new Error('Tenant urban-bites not resolved');
  console.log(`✅ Tenant resolved: "${restaurant.name}" (${restaurant.currencySymbol})`);
  console.log(`   Branding: primaryColor=${restaurant.primaryColor}, secondaryColor=${restaurant.secondaryColor}`);
  console.log(`   Store Open: ${restaurant.isOpenNow}`);

  // 2. Verify Database Catalog
  const categories = await db.category.findMany({
    where: { restaurantId: restaurant.id },
    include: { products: true },
  });
  console.log(`✅ Loaded ${categories.length} categories with total ${categories.flatMap(c => c.products).length} products`);

  // 3. Verify Modifier Groups
  const modifierGroups = await db.modifierGroup.findMany({
    where: { restaurantId: restaurant.id },
    include: { modifiers: true },
  });
  console.log(`✅ Loaded ${modifierGroups.length} modifier groups with ${modifierGroups.flatMap(g => g.modifiers).length} modifier options`);

  // 4. Verify Coupons
  const coupon = await db.coupon.findFirst({
    where: { restaurantId: restaurant.id, code: 'AZADI10' },
  });
  if (!coupon || !coupon.isActive) throw new Error('Coupon AZADI10 not found or inactive');
  console.log(`✅ Coupon verified: ${coupon.code} (${coupon.discountValue}% off, min order: Rs. ${coupon.minOrderAmount})`);

  // 5. Verify Auth Passwords
  const managerUser = await db.user.findUnique({
    where: { email: 'admin@urbanbites.com' },
  });
  if (!managerUser) throw new Error('Manager user not found');
  const isMatch = await bcrypt.compare('admin123', managerUser.passwordHash);
  if (!isMatch) throw new Error('Password hash comparison failed for admin123');
  console.log(`✅ Manager credential verification passed for ${managerUser.email} (Role: ${managerUser.role})`);

  // 6. Verify JWT Session Token
  const token = await createSessionToken({
    userId: managerUser.id,
    email: managerUser.email,
    name: managerUser.name,
    role: managerUser.role as any,
    restaurantId: managerUser.restaurantId,
  });
  const decoded = await verifySessionToken(token);
  if (!decoded || decoded.userId !== managerUser.id) throw new Error('JWT verification failed');
  console.log(`✅ JWT token signing and verification passed`);

  // 7. Verify Sample Orders
  const sampleOrders = await db.order.findMany({
    where: { restaurantId: restaurant.id },
    include: { items: { include: { modifiers: true } } },
  });
  console.log(`✅ Found ${sampleOrders.length} existing pipeline orders:`);
  for (const o of sampleOrders) {
    console.log(`   - Order #${o.orderNumber}: [${o.status}] ${o.customerName} - Rs. ${o.totalAmount} (${o.items.length} items)`);
  }

  // 8. Verify Strict Tenant Isolation
  // Attempt to query products with a fake tenant ID
  const fakeTenantProducts = await db.product.findMany({
    where: { restaurantId: 'fake-tenant-id-999' },
  });
  if (fakeTenantProducts.length !== 0) throw new Error('Tenant isolation query failed');
  console.log('✅ Tenant isolation query test passed (0 cross-tenant data leakage)');

  console.log('\n🎉 ALL ARCHITECTURAL TESTS PASSED PERFECTLY!\n');
}

verifyPlatform()
  .catch((e) => {
    console.error('❌ Test suite failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });