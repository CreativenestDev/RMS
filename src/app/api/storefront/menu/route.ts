import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRestaurantBySlug, getDefaultRestaurant } from '@/lib/tenant';
import { DEMO_CATEGORIES } from '@/lib/demo-data';

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

    try {
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

      if (categories && categories.length > 0) {
        return NextResponse.json({ categories });
      }
    } catch (dbErr) {
      console.warn('Database query failed in menu route, falling back to demo catalog:', dbErr);
    }

    return NextResponse.json({ categories: DEMO_CATEGORIES });
  } catch (error: any) {
    console.error('Menu API error:', error);
    return NextResponse.json({ categories: DEMO_CATEGORIES });
  }
}