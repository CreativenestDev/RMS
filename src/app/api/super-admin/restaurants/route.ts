import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Super Admin only.' }, { status: 403 });
    }

    const restaurants = await db.restaurant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true },
        },
        _count: {
          select: { orders: true, products: true },
        },
      },
    });

    return NextResponse.json({ restaurants });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch restaurants' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Super Admin only.' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      slug,
      adminName,
      adminEmail,
      adminPassword,
      primaryColor,
      secondaryColor,
      currency,
      currencySymbol,
    } = body;

    if (!name || !slug || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: 'Restaurant name, slug, admin email, and password are required' },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await db.restaurant.findUnique({
      where: { slug: slug.toLowerCase().trim() },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'A restaurant with this slug already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create Tenant in Transaction
    const newRestaurant = await db.$transaction(async (tx) => {
      const restaurant = await tx.restaurant.create({
        data: {
          name: name.trim(),
          slug: slug.toLowerCase().trim(),
          primaryColor: primaryColor || '#ea580c',
          secondaryColor: secondaryColor || '#0f172a',
          currency: currency || 'USD',
          currencySymbol: currencySymbol || '$',
          isActive: true,
          settings: {
            create: {
              minOrderAmount: 10,
              estimatedPrepTimeMinutes: 20,
              deliveryFeeBase: 3.5,
              freeDeliveryThreshold: 40,
              acceptsCash: true,
              acceptsCard: true,
              isStoreOpen: true,
            },
          },
          branches: {
            create: {
              name: 'Main Location',
              slug: 'main-location',
              isMainBranch: true,
            },
          },
        },
      });

      // Create Admin User for this restaurant
      await tx.user.create({
        data: {
          restaurantId: restaurant.id,
          name: adminName || `${name} Manager`,
          email: adminEmail.toLowerCase().trim(),
          passwordHash: hashedPassword,
          role: 'RESTAURANT_ADMIN',
        },
      });

      // Default business hours
      for (let i = 0; i <= 6; i++) {
        await tx.businessHour.create({
          data: {
            restaurantId: restaurant.id,
            dayOfWeek: i,
            openTime: '10:00',
            closeTime: '23:00',
            isClosed: false,
          },
        });
      }

      return restaurant;
    });

    return NextResponse.json({ success: true, restaurant: newRestaurant });
  } catch (error: any) {
    console.error('Create tenant error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create tenant restaurant' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { restaurantId, isActive } = body;

    const updated = await db.restaurant.update({
      where: { id: restaurantId },
      data: { isActive },
    });

    return NextResponse.json({ success: true, restaurant: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update tenant status' }, { status: 500 });
  }
}