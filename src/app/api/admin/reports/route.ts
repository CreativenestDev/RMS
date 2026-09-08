import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import { getDefaultRestaurant } from '@/lib/tenant';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    const targetRestaurantId =
      session?.restaurantId || (await getDefaultRestaurant()).id;

    const orders = await db.order.findMany({
      where: { restaurantId: targetRestaurantId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    });

    // Calculate product sales aggregated
    const productSalesMap: Record<
      string,
      { name: string; quantity: number; revenue: number }
    > = {};

    orders.forEach((o) => {
      if (o.status !== 'CANCELLED' && o.status !== 'REJECTED') {
        o.items.forEach((item) => {
          if (!productSalesMap[item.productName]) {
            productSalesMap[item.productName] = {
              name: item.productName,
              quantity: 0,
              revenue: 0,
            };
          }
          productSalesMap[item.productName].quantity += item.quantity;
          productSalesMap[item.productName].revenue += item.itemTotal;
        });
      }
    });

    const topProducts = Object.values(productSalesMap).sort(
      (a, b) => b.revenue - a.revenue
    );

    return NextResponse.json({ orders, topProducts });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}