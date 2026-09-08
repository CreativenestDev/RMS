import { NextRequest, NextResponse } from 'next/server';
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

    return NextResponse.json({ restaurant });
  } catch (error: any) {
    console.error('Config API error:', error);
    return NextResponse.json({ error: 'Failed to fetch restaurant config' }, { status: 500 });
  }
}