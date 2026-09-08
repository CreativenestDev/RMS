import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import { getDefaultRestaurant } from '@/lib/tenant';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    const targetRestaurantId =
      session?.restaurantId || (await getDefaultRestaurant()).id;

    const restaurant = await db.restaurant.findUnique({
      where: { id: targetRestaurantId },
      include: {
        settings: true,
        hours: true,
        deliveryZones: true,
      },
    });

    return NextResponse.json({ restaurant });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    const targetRestaurantId =
      session?.restaurantId || (await getDefaultRestaurant()).id;

    const body = await req.json();
    const {
      name,
      phone,
      email,
      address,
      currency,
      currencySymbol,
      taxRatePercent,
      primaryColor,
      secondaryColor,
      logoUrl,
      coverUrl,
      settings,
    } = body;

    const updated = await db.restaurant.update({
      where: { id: targetRestaurantId },
      data: {
        name,
        phone,
        email,
        address,
        currency,
        currencySymbol,
        taxRatePercent: parseFloat(taxRatePercent) || 8.0,
        primaryColor,
        secondaryColor,
        logoUrl,
        coverUrl,
        settings: {
          upsert: {
            create: {
              minOrderAmount: parseFloat(settings?.minOrderAmount) || 0,
              estimatedPrepTimeMinutes: parseInt(settings?.estimatedPrepTimeMinutes) || 20,
              deliveryFeeBase: parseFloat(settings?.deliveryFeeBase) || 3.5,
              freeDeliveryThreshold: parseFloat(settings?.freeDeliveryThreshold) || 45,
              noticeBanner: settings?.noticeBanner || null,
              isStoreOpen: settings?.isStoreOpen ?? true,
              autoAcceptOrders: settings?.autoAcceptOrders ?? false,
            },
            update: {
              minOrderAmount: parseFloat(settings?.minOrderAmount) || 0,
              estimatedPrepTimeMinutes: parseInt(settings?.estimatedPrepTimeMinutes) || 20,
              deliveryFeeBase: parseFloat(settings?.deliveryFeeBase) || 3.5,
              freeDeliveryThreshold: parseFloat(settings?.freeDeliveryThreshold) || 45,
              noticeBanner: settings?.noticeBanner || null,
              isStoreOpen: settings?.isStoreOpen ?? true,
              autoAcceptOrders: settings?.autoAcceptOrders ?? false,
            },
          },
        },
      },
      include: { settings: true },
    });

    return NextResponse.json({ success: true, restaurant: updated });
  } catch (error: any) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}