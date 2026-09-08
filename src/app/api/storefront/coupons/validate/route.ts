import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getDefaultRestaurant } from '@/lib/tenant';

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal, restaurantId } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Promo code is required' }, { status: 400 });
    }

    const targetRestaurantId =
      restaurantId || (await getDefaultRestaurant()).id;

    const coupon = await db.coupon.findFirst({
      where: {
        restaurantId: targetRestaurantId,
        code: code.trim().toUpperCase(),
        isActive: true,
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid or expired coupon code' }, { status: 400 });
    }

    const now = new Date();
    if (coupon.startDate && coupon.startDate > now) {
      return NextResponse.json({ error: 'This coupon is not yet active' }, { status: 400 });
    }
    if (coupon.endDate && coupon.endDate < now) {
      return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
    }

    if (coupon.usageLimitTotal && coupon.timesUsed >= coupon.usageLimitTotal) {
      return NextResponse.json({ error: 'This coupon usage limit has been reached' }, { status: 400 });
    }

    const currentSubtotal = Number(subtotal) || 0;
    if (currentSubtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          error: `Minimum order amount for this coupon is $${coupon.minOrderAmount.toFixed(2)}`,
        },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (currentSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, currentSubtotal);
    }

    discountAmount = Math.round(discountAmount * 100) / 100;

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
    });
  } catch (error: any) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}