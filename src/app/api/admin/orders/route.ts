import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';
import { getDefaultRestaurant } from '@/lib/tenant';
import { broadcastTenantOrderEvent } from '@/lib/events';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    const targetRestaurantId =
      session?.restaurantId || (await getDefaultRestaurant()).id;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const whereClause: any = {
      restaurantId: targetRestaurantId,
    };

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const orders = await db.order.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            modifiers: true,
          },
        },
        payments: true,
      },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error('Fetch admin orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    const targetRestaurantId =
      session?.restaurantId || (await getDefaultRestaurant()).id;

    const body = await req.json();
    const { orderId, status, cancelReason } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: 'orderId and status are required' }, { status: 400 });
    }

    // Verify order belongs to this tenant
    const existingOrder = await db.order.findFirst({
      where: { id: orderId, restaurantId: targetRestaurantId },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    const now = new Date();
    if (status === 'CONFIRMED' && !existingOrder.confirmedAt) {
      updateData.confirmedAt = now;
    } else if (status === 'PREPARING' && !existingOrder.preparingAt) {
      updateData.preparingAt = now;
    } else if (status === 'READY' && !existingOrder.readyAt) {
      updateData.readyAt = now;
    } else if (status === 'OUT_FOR_DELIVERY' && !existingOrder.outForDeliveryAt) {
      updateData.outForDeliveryAt = now;
    } else if (status === 'DELIVERED') {
      updateData.deliveredAt = now;
      updateData.paymentStatus = 'PAID';
    } else if (status === 'CANCELLED' || status === 'REJECTED') {
      updateData.cancelReason = cancelReason || null;
    }

    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: {
          include: {
            modifiers: true,
          },
        },
      },
    });

    // Broadcast SSE to KDS, Admin, and Customer Live Tracker
    broadcastTenantOrderEvent(targetRestaurantId, {
      type: 'STATUS_CHANGED',
      restaurantId: targetRestaurantId,
      order: updatedOrder,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}