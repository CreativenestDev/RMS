import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRestaurantBySlug, getDefaultRestaurant } from '@/lib/tenant';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('restaurant');

    const restaurant = slug
      ? await getRestaurantBySlug(slug)
      : await getDefaultRestaurant();

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const categories = await db.category.findMany({
      where: {
        restaurantId: restaurant.id,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
      include: {
        products: {
          where: { isAvailable: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            modifierGroupLinks: {
              orderBy: { sortOrder: 'asc' },
              include: {
                modifierGroup: {
                  include: {
                    modifiers: {
                      where: { isAvailable: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('Menu API error:', error);
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
  }
}