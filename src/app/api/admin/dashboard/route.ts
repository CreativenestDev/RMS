import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import { getDefaultRestaurant } from '@/lib/tenant';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    const targetRestaurantId =
      session?.restaurantId || (await getDefaultRestaurant()).id;

    // Today's start
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      allOrders,
      pendingCount,
      preparingCount,
      readyCount,
      completedCount,
      recentOrders,
    ] = await Promise.all([
      db.order.findMany({
        where: { restaurantId: targetRestaurantId },
        select: { totalAmount: true, status: true, createdAt: true },
      }),
      db.order.count({
        where: { restaurantId: targetRestaurantId, status: 'PENDING' },
      }),
      db.order.count({
        where: { restaurantId: targetRestaurantId, status: 'PREPARING' },
      }),
      db.order.count({
        where: { restaurantId: targetRestaurantId, status: 'READY' },
      }),
      db.order.count({
        where: { restaurantId: targetRestaurantId, status: 'DELIVERED' },
      }),
      db.order.findMany({
        where: { restaurantId: targetRestaurantId },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: {
          items: true,
        },
      }),
    ]);

    const todayOrders = allOrders.filter((o) => new Date(o.createdAt) >= today);
    const todayRevenue = todayOrders
      .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REJECTED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const totalRevenue = allOrders
      .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REJECTED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const avgTicket =
      todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0;

    return NextResponse.json({
      stats: {
        todayRevenue: Math.round(todayRevenue * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        todayOrderCount: todayOrders.length,
        totalOrderCount: allOrders.length,
        avgTicket: Math.round(avgTicket * 100) / 100,
        pendingCount,
        preparingCount,
        readyCount,
        completedCount,
      },
      recentOrders,
    });
  } catch (error: any) {
    console.error('Admin Dashboard API error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}