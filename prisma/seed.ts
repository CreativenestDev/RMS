import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Pakistani White-Label Platform Database...');

  try {
    const existing = await prisma.restaurant.count();
    if (existing > 0) {
      console.log(`✅ Database already seeded with ${existing} restaurant(s). Skipping re-seed.`);
      return;
    }
  } catch (checkErr) {
    console.log('Tables initializing or first-time setup...');
  }

  // 1. Clean existing records
  await prisma.orderItemModifier.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.order.deleteMany();
  await prisma.modifier.deleteMany();
  await prisma.productModifierGroup.deleteMany();
  await prisma.modifierGroup.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.deliveryZone.deleteMany();
  await prisma.businessHour.deleteMany();
  await prisma.restaurantSetting.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.user.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.restaurant.deleteMany();

  // 2. Create Platform Super Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const kitchenPassword = await bcrypt.hash('kitchen123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);

  await prisma.user.create({
    data: {
      name: 'Platform Super Admin',
      email: 'superadmin@platform.com',
      passwordHash: adminPassword,
      role: 'SUPER_ADMIN',
      phone: '+92 300 0000000',
    },
  });

  // 3. Create Demo Restaurant: Urban Bites (Lahore, Pakistan)
  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'Urban Bites',
      slug: 'urban-bites',
      logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      phone: '+92 300 8472911',
      email: 'hello@urbanbites.pk',
      address: 'Plot 14-C, Main Boulevard, Gulberg III, Lahore, Pakistan',
      currency: 'PKR',
      currencySymbol: 'Rs. ',
      taxRatePercent: 5.0,
      primaryColor: '#ea580c',
      secondaryColor: '#0f172a',
      isActive: true,
      settings: {
        create: {
          minOrderAmount: 600.0,
          estimatedPrepTimeMinutes: 30,
          deliveryRadiusKm: 15.0,
          deliveryFeeBase: 180.0,
          freeDeliveryThreshold: 2000.0,
          acceptsCash: true,
          acceptsCard: true,
          autoAcceptOrders: false,
          soundNotificationEnabled: true,
          noticeBanner: '🎉 Free delivery on all orders above Rs. 2,000! Use code AZADI10 for 10% off.',
          isStoreOpen: true,
        },
      },
    },
  });

  // 4. Create Main Branch
  const mainBranch = await prisma.branch.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Gulberg Flagship Branch',
      slug: 'gulberg-flagship',
      address: 'Main Boulevard, Gulberg III, Lahore',
      phone: '+92 42 35789000',
      isMainBranch: true,
      isActive: true,
    },
  });

  // 5. Create Staff Accounts
  await prisma.user.createMany({
    data: [
      {
        restaurantId: restaurant.id,
        name: 'Bilal Khan (Branch Manager)',
        email: 'admin@urbanbites.com',
        passwordHash: adminPassword,
        role: 'RESTAURANT_ADMIN',
        phone: '+92 300 8472911',
      },
      {
        restaurantId: restaurant.id,
        name: 'Ustad Rashid (Head Chef)',
        email: 'kitchen@urbanbites.com',
        passwordHash: kitchenPassword,
        role: 'KITCHEN',
        phone: '+92 300 8472912',
      },
      {
        restaurantId: restaurant.id,
        name: 'Ayesha Malik (Counter Staff)',
        email: 'staff@urbanbites.com',
        passwordHash: staffPassword,
        role: 'STAFF',
        phone: '+92 300 8472913',
      },
    ],
  });

  // 6. Business Hours (PK Standard: 12:00 PM - 01:00 AM)
  const hoursData = [
    { dayOfWeek: 0, openTime: '12:00', closeTime: '01:00' }, // Sunday
    { dayOfWeek: 1, openTime: '12:00', closeTime: '00:00' }, // Monday
    { dayOfWeek: 2, openTime: '12:00', closeTime: '00:00' }, // Tuesday
    { dayOfWeek: 3, openTime: '12:00', closeTime: '00:00' }, // Wednesday
    { dayOfWeek: 4, openTime: '12:00', closeTime: '01:00' }, // Thursday
    { dayOfWeek: 5, openTime: '13:00', closeTime: '02:00' }, // Friday (post Jummah)
    { dayOfWeek: 6, openTime: '12:00', closeTime: '02:00' }, // Saturday
  ];
  for (const h of hoursData) {
    await prisma.businessHour.create({
      data: {
        restaurantId: restaurant.id,
        dayOfWeek: h.dayOfWeek,
        openTime: h.openTime,
        closeTime: h.closeTime,
        isClosed: false,
      },
    });
  }

  // 7. Delivery Zones (Pakistani Metro Areas)
  await prisma.deliveryZone.createMany({
    data: [
      {
        restaurantId: restaurant.id,
        name: 'Zone 1 - Gulberg, Main Market, Jail Road (0-5 km)',
        minDistanceKm: 0,
        maxDistanceKm: 5,
        deliveryFee: 150,
        minOrderAmount: 600,
        estimatedDeliveryMinutes: 30,
      },
      {
        restaurantId: restaurant.id,
        name: 'Zone 2 - DHA Phase 1-5, Model Town, Cantt (5-10 km)',
        minDistanceKm: 5,
        maxDistanceKm: 10,
        deliveryFee: 250,
        minOrderAmount: 1000,
        estimatedDeliveryMinutes: 45,
      },
      {
        restaurantId: restaurant.id,
        name: 'Zone 3 - Johar Town, Bahria Town, Lake City (10-18 km)',
        minDistanceKm: 10,
        maxDistanceKm: 18,
        deliveryFee: 400,
        minOrderAmount: 1500,
        estimatedDeliveryMinutes: 60,
      },
    ],
  });

  // 8. Categories (Authentic Pakistani / Fast-Food Casual)
  const catBurgers = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Crispy Zingers & Smash Burgers',
      slug: 'burgers',
      description: 'Hand-crafted smashed Angus beef and golden crispy buttermilk fried chicken zingers.',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
      sortOrder: 1,
    },
  });

  const catPizzas = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Artisan & Tikka Pizzas',
      slug: 'pizzas',
      description: 'Slow-fermented sourdough pizzas topped with tandoori tikka, mughlai cream, and hot honey.',
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
      sortOrder: 2,
    },
  });

  const catRolls = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Charcoal BBQ & Paratha Rolls',
      slug: 'rolls-bbq',
      description: 'Smoked Malai Boti, spicy Bihari beef strips, and chicken tikka in crispy lachha parathas.',
      imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
      sortOrder: 3,
    },
  });

  const catBiryani = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Biryani & Desi Karahi Specials',
      slug: 'biryani-karahi',
      description: 'Aromatic Karachi Nalli Biryani and fresh chicken shinwari karahi cooked in pure desi ghee.',
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
      sortOrder: 4,
    },
  });

  const catSides = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Loaded Fries & Wings',
      slug: 'sides',
      description: 'Cheesy pizza fries, crispy golden wings, and spicy garlic mayo dips.',
      imageUrl: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80',
      sortOrder: 5,
    },
  });

  const catDrinks = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Karak Chai & Cold Drinks',
      slug: 'drinks',
      description: 'Traditional Matka Karak Chai, Mint Margaritas, Kulfi Rabri shakes, and chilled Pakola.',
      imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
      sortOrder: 6,
    },
  });

  const catDesserts = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Mithai & Sweet Treats',
      slug: 'desserts',
      description: 'Hot Gulab Jamuns with ice cream, molten chocolate lava cake, and Nutella paratha.',
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
      sortOrder: 7,
    },
  });

  const catCombos = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Dhamaka Deals & Dosti Feasts',
      slug: 'combos',
      description: 'Value-packed combo boxes and family feast platters with maximum savings.',
      imageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&q=80',
      sortOrder: 8,
    },
  });

  // 9. Modifier Groups
  const mgSauces = await prisma.modifierGroup.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Choose Your Chutney / Sauce',
      description: 'Select your signature complimentary house dip',
      minSelections: 1,
      maxSelections: 2,
      isRequired: true,
      allowMultiple: false,
      modifiers: {
        create: [
          { name: 'Urban Garlic Mayo', price: 0, isDefault: true },
          { name: 'Mint & Coriander Raita', price: 0 },
          { name: 'Spicy Imli (Tamarind) Chutney', price: 50 },
          { name: 'Fiery Chipotle Aioli', price: 70 },
        ],
      },
    },
  });

  const mgExtras = await prisma.modifierGroup.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Gourmet Add-Ons',
      description: 'Customize with extra cheese, egg, or patty',
      minSelections: 0,
      maxSelections: 4,
      isRequired: false,
      allowMultiple: true,
      modifiers: {
        create: [
          { name: 'Extra Melted Cheddar Slice', price: 120 },
          { name: 'Crispy Fried Sunny Egg', price: 90 },
          { name: 'Jalapeno Slices', price: 70 },
          { name: 'Extra Zinger Chicken Fillet', price: 320 },
          { name: 'Extra Beef Smash Patty', price: 380 },
        ],
      },
    },
  });

  const mgCrust = await prisma.modifierGroup.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Pizza Crust Style',
      description: 'Hand-stretched sourdough preference',
      minSelections: 1,
      maxSelections: 1,
      isRequired: true,
      allowMultiple: false,
      modifiers: {
        create: [
          { name: 'Artisan Hand-Tossed', price: 0, isDefault: true },
          { name: 'Crispy Roman Thin Crust', price: 0 },
          { name: 'Garlic Cheese Stuffed Crust', price: 290 },
        ],
      },
    },
  });

  const mgDrinkSize = await prisma.modifierGroup.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Beverage Size',
      description: 'Select bottle size',
      minSelections: 1,
      maxSelections: 1,
      isRequired: true,
      allowMultiple: false,
      modifiers: {
        create: [
          { name: 'Regular Cup / Can (300ml)', price: 0, isDefault: true },
          { name: 'Large Chilled Bottle (500ml)', price: 60 },
          { name: 'Family Jumbo Bottle (1.5 Litre)', price: 180 },
        ],
      },
    },
  });

  // 10. Products (All Prices in PKR)
  // Product 1: Mighty Zinger
  const p1 = await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catBurgers.id,
      name: 'Mighty Crispy Zinger Burger',
      slug: 'mighty-crispy-zinger-burger',
      description: 'Jumbo succulent chicken thigh fillet, seasoned in 11 secret spices, fried to crispy golden perfection, crunchy iceberg lettuce, and spicy garlic mayo on toasted brioche.',
      basePrice: 690,
      compareAtPrice: 790,
      imageUrl: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isFeatured: true,
      preparationTimeMinutes: 15,
      calories: 720,
      dietaryFlags: JSON.stringify(['halal', 'spicy']),
      sortOrder: 1,
      modifierGroupLinks: {
        create: [
          { modifierGroupId: mgSauces.id, sortOrder: 1 },
          { modifierGroupId: mgExtras.id, sortOrder: 2 },
        ],
      },
    },
  });

  // Product 2: Beef Chapli Smash Burger
  const p2 = await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catBurgers.id,
      name: 'Peshawari Beef Chapli Smash Burger',
      slug: 'peshawari-beef-chapli-smash-burger',
      description: 'Double smashed Certified Angus beef infused with cracked coriander, pomegranate seeds, green chilies, heirloom tomato, sunny egg, and mint raita on artisanal brioche.',
      basePrice: 850,
      compareAtPrice: 950,
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isFeatured: true,
      preparationTimeMinutes: 18,
      calories: 840,
      dietaryFlags: JSON.stringify(['halal', 'spicy']),
      sortOrder: 2,
      modifierGroupLinks: {
        create: [
          { modifierGroupId: mgSauces.id, sortOrder: 1 },
          { modifierGroupId: mgExtras.id, sortOrder: 2 },
        ],
      },
    },
  });

  // Product 3: Double Truffle Beef Burger
  const p3 = await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catBurgers.id,
      name: 'Double Truffle Angus Melt',
      slug: 'double-truffle-angus-melt',
      description: 'Double 100% prime beef patties, melted yellow cheddar, caramelized balsamic onions, garlic-sautéed mushrooms, and black truffle mayo.',
      basePrice: 1190,
      imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isFeatured: true,
      preparationTimeMinutes: 16,
      calories: 910,
      dietaryFlags: JSON.stringify(['halal']),
      sortOrder: 3,
      modifierGroupLinks: {
        create: [{ modifierGroupId: mgExtras.id, sortOrder: 1 }],
      },
    },
  });

  // Product 4: Chicken Tikka Pizza
  const p4 = await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catPizzas.id,
      name: 'Smoked Chicken Tikka Feast Pizza (Large)',
      slug: 'smoked-chicken-tikka-feast-pizza',
      description: 'Hand-stretched sourdough pizza loaded with charcoal-smoked chicken tikka, bell peppers, red onions, melted mozzarella, and signature tikka sauce.',
      basePrice: 1490,
      compareAtPrice: 1750,
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isFeatured: true,
      preparationTimeMinutes: 20,
      calories: 1350,
      dietaryFlags: JSON.stringify(['halal', 'spicy']),
      sortOrder: 1,
      modifierGroupLinks: {
        create: [{ modifierGroupId: mgCrust.id, sortOrder: 1 }],
      },
    },
  });

  // Product 5: Creamy Mughlai Pizza
  const p5 = await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catPizzas.id,
      name: 'Creamy Mughlai Crust Pizza (Large)',
      slug: 'creamy-mughlai-crust-pizza',
      description: 'Mughlai white spiced chicken, rich velvety garlic cream sauce, spicy jalapenos, mushrooms, and double mozzarella.',
      basePrice: 1690,
      imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isFeatured: false,
      preparationTimeMinutes: 22,
      calories: 1420,
      dietaryFlags: JSON.stringify(['halal']),
      sortOrder: 2,
      modifierGroupLinks: {
        create: [{ modifierGroupId: mgCrust.id, sortOrder: 1 }],
      },
    },
  });

  // Product 6: Malai Boti Paratha Roll
  const p6 = await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catRolls.id,
      name: 'Smoked Chicken Malai Boti Paratha Roll',
      slug: 'smoked-chicken-malai-boti-paratha-roll',
      description: 'Tender chicken skewers marinated in cream, green chilies, and white pepper, rolled in crispy golden lachha paratha with garlic mayo and spiced onions.',
      basePrice: 450,
      compareAtPrice: 500,
      imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isFeatured: true,
      preparationTimeMinutes: 12,
      calories: 540,
      dietaryFlags: JSON.stringify(['halal']),
      sortOrder: 1,
      modifierGroupLinks: {
        create: [{ modifierGroupId: mgSauces.id, sortOrder: 1 }],
      },
    },
  });

  // Product 7: Spicy Beef Bihari Roll
  const p7 = await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catRolls.id,
      name: 'Spicy Beef Bihari Kabab Roll',
      slug: 'spicy-beef-bihari-kabab-roll',
      description: 'Raw papaya and mustard-oil tenderized beef strips, slow-cooked over coal embers, served in flaky paratha with spicy tamarind chutney.',
      basePrice: 550,
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isFeatured: false,
      preparationTimeMinutes: 14,
      calories: 610,
      dietaryFlags: JSON.stringify(['halal', 'spicy']),
      sortOrder: 2,
      modifierGroupLinks: {
        create: [{ modifierGroupId: mgSauces.id, sortOrder: 1 }],
      },
    },
  });

  // Product 8: Karachi Nalli Biryani
  const p8 = await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catBiryani.id,
      name: 'Karachi Special Beef Nalli Biryani',
      slug: 'karachi-special-beef-nalli-biryani',
      description: 'Aromatic aged basmati sella rice, succulent beef shank, spiced marrow bone (nalli), baby potatoes, and boiled egg, served with fresh mint raita.',
      basePrice: 790,
      compareAtPrice: 890,
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isFeatured: true,
      preparationTimeMinutes: 15,
      calories: 980,
      dietaryFlags: JSON.stringify(['halal', 'spicy']),
      sortOrder: 1,
    },
  });

  // Product 9: Shinwari Chicken Karahi
  const p9 = await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catBiryani.id,
      name: 'Desi Ghee Shinwari Chicken Karahi (Full)',
      slug: 'desi-ghee-shinwari-chicken-karahi',
      description: 'Tender farm chicken cooked fresh in an iron wok with ripe Peshawar tomatoes, green chilies, ginger, and crushed black pepper in pure desi ghee.',
      basePrice: 1850,
      imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isFeatured: true,
      preparationTimeMinutes: 25,
      calories: 1450,
      dietaryFlags: JSON.stringify(['halal']),
      sortOrder: 2,
    },
  });

  // Product 10: Pizza Loaded Cheesy Fries
  const p10 = await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catSides.id,
      name: 'Pizza Loaded Cheesy Fries',
      slug: 'pizza-loaded-cheesy-fries',
      description: 'Crisp golden fries drenched in pizza tomato herb sauce, chunks of smoked chicken tikka, black olives, jalapenos, and melted mozzarella.',
      basePrice: 650,
      imageUrl: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isFeatured: true,
      preparationTimeMinutes: 10,
      calories: 680,
      dietaryFlags: JSON.stringify(['halal']),
      sortOrder: 1,
      modifierGroupLinks: {
        create: [{ modifierGroupId: mgSauces.id, sortOrder: 1 }],
      },
    },
  });

  // Product 11: Matka Karak Chai
  const p11 = await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catDrinks.id,
      name: 'Matka Karak Doodh Patti Chai',
      slug: 'matka-karak-doodh-patti-chai',
      description: 'Slow-boiled creamy Pakistani milk tea, infused with green cardamoms and saffron, served piping hot in an authentic earthen clay matka cup.',
      basePrice: 180,
      imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isFeatured: false,
      preparationTimeMinutes: 6,
      calories: 160,
      dietaryFlags: JSON.stringify(['veg', 'gluten_free']),
      sortOrder: 1,
    },
  });

  // Product 12: Fresh Mint Margarita
  const p12 = await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catDrinks.id,
      name: 'Fresh Mint Lemon Margarita',
      slug: 'fresh-mint-lemon-margarita',
      description: 'Hand-picked fresh garden mint, freshly squeezed lemon juice, black salt, and chilled fizzy soda blended with crushed ice.',
      basePrice: 290,
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isFeatured: false,
      preparationTimeMinutes: 5,
      calories: 110,
      dietaryFlags: JSON.stringify(['vegan', 'gluten_free']),
      sortOrder: 2,
      modifierGroupLinks: {
        create: [{ modifierGroupId: mgDrinkSize.id, sortOrder: 1 }],
      },
    },
  });

  // Product 13: Hot Gulab Jamun
  const p13 = await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catDesserts.id,
      name: 'Hot Gulab Jamun with Ice Cream',
      slug: 'hot-gulab-jamun-with-ice-cream',
      description: 'Two warm, melt-in-mouth syrup-soaked golden khoya dumplings served with a scoop of premium vanilla bean gelato.',
      basePrice: 350,
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isFeatured: false,
      preparationTimeMinutes: 5,
      calories: 420,
      dietaryFlags: JSON.stringify(['veg']),
      sortOrder: 1,
    },
  });

  // Product 14: Dhamaka Zinger Box Deal
  const p14 = await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catCombos.id,
      name: 'Dhamaka Zinger Box Deal',
      slug: 'dhamaka-zinger-box-deal',
      description: '1 Mighty Crispy Zinger Burger + 1 Crispy Fried Chicken Piece + 1 Regular Fries + 1 Chilled Soft Drink.',
      basePrice: 1090,
      compareAtPrice: 1350,
      imageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isFeatured: true,
      preparationTimeMinutes: 16,
      calories: 1250,
      dietaryFlags: JSON.stringify(['halal']),
      sortOrder: 1,
    },
  });

  // Product 15: Family Dosti Feast Deal
  const p15 = await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catCombos.id,
      name: 'Family Dosti Feast for Four',
      slug: 'family-dosti-feast-for-four',
      description: '1 Large Chicken Tikka Pizza + 2 Mighty Zinger Burgers + 1 Large Pizza Loaded Fries + 1.5 Litre Chilled Drink.',
      basePrice: 3490,
      compareAtPrice: 4200,
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isFeatured: true,
      preparationTimeMinutes: 25,
      calories: 3100,
      dietaryFlags: JSON.stringify(['halal']),
      sortOrder: 2,
    },
  });

  // 11. Pakistani Coupons
  await prisma.coupon.createMany({
    data: [
      {
        restaurantId: restaurant.id,
        code: 'AZADI10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderAmount: 1200,
        maxDiscountAmount: 500,
        usageLimitTotal: 500,
        isActive: true,
      },
      {
        restaurantId: restaurant.id,
        code: 'BITE200',
        discountType: 'FIXED_AMOUNT',
        discountValue: 200,
        minOrderAmount: 1500,
        usageLimitTotal: 300,
        isActive: true,
      },
      {
        restaurantId: restaurant.id,
        code: 'FEAST500',
        discountType: 'FIXED_AMOUNT',
        discountValue: 500,
        minOrderAmount: 3500,
        usageLimitTotal: 100,
        isActive: true,
      },
    ],
  });

  // 12. Pakistani Sample Customers
  const customer1 = await prisma.customer.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Hamza Tariq',
      email: 'hamza.tariq@example.pk',
      phone: '0300-8412345',
      addresses: {
        create: {
          label: 'Home',
          street: 'House 42, Sector Y, Phase 3 DHA',
          city: 'Lahore',
          postalCode: '54000',
          deliveryInstructions: 'Near Lalik Jan Chowk, ring the outer gate bell.',
          isDefault: true,
        },
      },
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Ayesha Siddiqui',
      email: 'ayesha.s@example.pk',
      phone: '0321-4567890',
      addresses: {
        create: {
          label: 'Office',
          street: 'Floor 4, Arfa Software Technology Park, Ferozepur Road',
          city: 'Lahore',
          postalCode: '54600',
          deliveryInstructions: 'Hand over at reception security desk.',
          isDefault: true,
        },
      },
    },
  });

  // 13. Seed Sample Orders in PKR
  // Order 1: PENDING
  await prisma.order.create({
    data: {
      restaurantId: restaurant.id,
      branchId: mainBranch.id,
      customerId: customer1.id,
      orderNumber: 'UB-1001',
      status: 'PENDING',
      orderType: 'DELIVERY',
      customerName: 'Hamza Tariq',
      customerEmail: 'hamza.tariq@example.pk',
      customerPhone: '0300-8412345',
      deliveryAddress: JSON.stringify({
        street: 'House 42, Sector Y, Phase 3 DHA',
        city: 'Lahore',
        postalCode: '54000',
        instructions: 'Near Lalik Jan Chowk, call upon arrival',
      }),
      subtotal: 1890,
      discountAmount: 189,
      deliveryFee: 150,
      taxAmount: 85,
      totalAmount: 1936,
      paymentMethod: 'CASH_ON_DELIVERY',
      paymentStatus: 'PENDING',
      specialInstructions: 'Please make zinger extra crispy and send extra mint raita!',
      items: {
        create: [
          {
            productId: p1.id,
            productName: p1.name,
            productPrice: 690,
            quantity: 1,
            itemTotal: 810,
            specialInstructions: 'Extra spicy garlic mayo',
            modifiers: {
              create: [
                { modifierName: 'Extra Melted Cheddar Slice', modifierPrice: 120, quantity: 1 },
              ],
            },
          },
          {
            productId: p6.id,
            productName: p6.name,
            productPrice: 450,
            quantity: 1,
            itemTotal: 450,
          },
          {
            productId: p10.id,
            productName: p10.name,
            productPrice: 650,
            quantity: 1,
            itemTotal: 650,
          },
        ],
      },
    },
  });

  // Order 2: PREPARING (In kitchen)
  await prisma.order.create({
    data: {
      restaurantId: restaurant.id,
      branchId: mainBranch.id,
      customerId: customer2.id,
      orderNumber: 'UB-1002',
      status: 'PREPARING',
      orderType: 'DELIVERY',
      customerName: 'Ayesha Siddiqui',
      customerEmail: 'ayesha.s@example.pk',
      customerPhone: '0321-4567890',
      deliveryAddress: JSON.stringify({
        street: 'Floor 4, Arfa Software Technology Park, Ferozepur Road',
        city: 'Lahore',
        postalCode: '54600',
        instructions: 'Deliver to 4th floor reception',
      }),
      subtotal: 2280,
      discountAmount: 200,
      deliveryFee: 250,
      taxAmount: 104,
      totalAmount: 2434,
      paymentMethod: 'EASYPAISA',
      paymentStatus: 'PAID',
      confirmedAt: new Date(Date.now() - 15 * 60000),
      preparingAt: new Date(Date.now() - 10 * 60000),
      items: {
        create: [
          {
            productId: p4.id,
            productName: p4.name,
            productPrice: 1490,
            quantity: 1,
            itemTotal: 1780,
            specialInstructions: 'Cheese stuffed crust',
            modifiers: {
              create: [{ modifierName: 'Garlic Cheese Stuffed Crust', modifierPrice: 290, quantity: 1 }],
            },
          },
          {
            productId: p8.id,
            productName: p8.name,
            productPrice: 790,
            quantity: 1,
            itemTotal: 790,
          },
        ],
      },
    },
  });

  // Order 3: READY (Waiting for pickup)
  await prisma.order.create({
    data: {
      restaurantId: restaurant.id,
      branchId: mainBranch.id,
      orderNumber: 'UB-1003',
      status: 'READY',
      orderType: 'PICKUP',
      customerName: 'Usman Farooq',
      customerEmail: 'usman.f@example.pk',
      customerPhone: '0333-7890123',
      subtotal: 1090,
      discountAmount: 0,
      deliveryFee: 0,
      taxAmount: 55,
      totalAmount: 1145,
      paymentMethod: 'PAY_AT_RESTAURANT',
      paymentStatus: 'PENDING',
      confirmedAt: new Date(Date.now() - 25 * 60000),
      preparingAt: new Date(Date.now() - 20 * 60000),
      readyAt: new Date(Date.now() - 4 * 60000),
      items: {
        create: [
          {
            productId: p14.id,
            productName: p14.name,
            productPrice: 1090,
            quantity: 1,
            itemTotal: 1090,
          },
        ],
      },
    },
  });

  // Order 4: DELIVERED (Past completed)
  await prisma.order.create({
    data: {
      restaurantId: restaurant.id,
      branchId: mainBranch.id,
      orderNumber: 'UB-1004',
      status: 'DELIVERED',
      orderType: 'DELIVERY',
      customerName: 'Dr. Zainab Ali',
      customerEmail: 'zainab.ali@example.pk',
      customerPhone: '0302-3456789',
      deliveryAddress: JSON.stringify({
        street: 'House 18, Block G, Model Town',
        city: 'Lahore',
        postalCode: '54700',
      }),
      subtotal: 3490,
      discountAmount: 500,
      deliveryFee: 0, // Free delivery above 2000!
      taxAmount: 150,
      totalAmount: 3140,
      paymentMethod: 'CASH_ON_DELIVERY',
      paymentStatus: 'PAID',
      confirmedAt: new Date(Date.now() - 90 * 60000),
      preparingAt: new Date(Date.now() - 75 * 60000),
      readyAt: new Date(Date.now() - 55 * 60000),
      outForDeliveryAt: new Date(Date.now() - 45 * 60000),
      deliveredAt: new Date(Date.now() - 25 * 60000),
      items: {
        create: [
          {
            productId: p15.id,
            productName: p15.name,
            productPrice: 3490,
            quantity: 1,
            itemTotal: 3490,
          },
        ],
      },
    },
  });

  console.log('✅ Pakistani Seed completed successfully!');
  console.log('Currency: PKR (Rs. )');
  console.log('Demo Accounts:');
  console.log('  Platform Super Admin: superadmin@platform.com / admin123');
  console.log('  Restaurant Manager:   admin@urbanbites.com / admin123');
  console.log('  Kitchen Staff:        kitchen@urbanbites.com / kitchen123');
  console.log('  Front Staff:          staff@urbanbites.com / staff123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });