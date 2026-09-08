import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getDefaultRestaurant } from '@/lib/tenant';
import { broadcastTenantOrderEvent } from '@/lib/events';
import { getPaymentProvider } from '@/lib/payments';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      restaurantId: reqRestaurantId,
      orderType = 'DELIVERY',
      customer,
      deliveryAddress,
      deliveryZoneId,
      items,
      couponCode,
      paymentMethod = 'CASH_ON_DELIVERY',
      specialInstructions,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!customer?.name || !customer?.phone || !customer?.email) {
      return NextResponse.json(
        { error: 'Customer name, email, and phone are required' },
        { status: 400 }
      );
    }

    if (orderType === 'DELIVERY' && (!deliveryAddress?.street || !deliveryAddress?.city)) {
      return NextResponse.json(
        { error: 'Delivery street and city are required for delivery orders' },
        { status: 400 }
      );
    }

    // Resolve restaurant
    const restaurant = reqRestaurantId
      ? await db.restaurant.findUnique({
          where: { id: reqRestaurantId },
          include: { settings: true, deliveryZones: true, branches: true },
        })
      : await db.restaurant.findFirst({
          where: { isActive: true },
          include: { settings: true, deliveryZones: true, branches: true },
        });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const settings = restaurant.settings;

    // Fetch verified product prices from DB
    const productIds = items.map((i: any) => i.productId);
    const dbProducts = await db.product.findMany({
      where: {
        id: { in: productIds },
        restaurantId: restaurant.id,
        isAvailable: true,
      },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Fetch verified modifier prices from DB
    const allModIds = items.flatMap((i: any) =>
      (i.selectedModifiers || []).map((m: any) => m.modifierId)
    );
    const dbModifiers = await db.modifier.findMany({
      where: { id: { in: allModIds }, isAvailable: true },
    });
    const modifierMap = new Map(dbModifiers.map((m) => [m.id, m]));

    // Calculate subtotal server-side
    let calculatedSubtotal = 0;
    const verifiedOrderItems: any[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product "${item.name}" is no longer available` },
          { status: 400 }
        );
      }

      let itemModifiersTotal = 0;
      const verifiedModifiers: any[] = [];

      for (const sm of item.selectedModifiers || []) {
        const mod = modifierMap.get(sm.modifierId);
        if (mod) {
          const modQty = sm.quantity || 1;
          itemModifiersTotal += mod.price * modQty;
          verifiedModifiers.push({
            modifierId: mod.id,
            modifierName: mod.name,
            modifierPrice: mod.price,
            quantity: modQty,
          });
        }
      }

      const verifiedUnitPrice = product.basePrice + itemModifiersTotal;
      const verifiedItemTotal = verifiedUnitPrice * item.quantity;
      calculatedSubtotal += verifiedItemTotal;

      verifiedOrderItems.push({
        productId: product.id,
        productName: product.name,
        productPrice: product.basePrice,
        quantity: item.quantity,
        itemTotal: verifiedItemTotal,
        specialInstructions: item.specialInstructions || null,
        modifiers: verifiedModifiers,
      });
    }

    // Check minimum order amount
    if (settings && calculatedSubtotal < settings.minOrderAmount) {
      return NextResponse.json(
        {
          error: `Minimum order amount is ${restaurant.currencySymbol}${settings.minOrderAmount.toFixed(2)}`,
        },
        { status: 400 }
      );
    }

    // Delivery fee calculation
    let deliveryFee = 0;
    if (orderType === 'DELIVERY') {
      if (settings?.freeDeliveryThreshold && calculatedSubtotal >= settings.freeDeliveryThreshold) {
        deliveryFee = 0;
      } else if (deliveryZoneId) {
        const zone = restaurant.deliveryZones.find((z) => z.id === deliveryZoneId);
        deliveryFee = zone ? zone.deliveryFee : (settings?.deliveryFeeBase ?? 3.99);
      } else {
        deliveryFee = settings?.deliveryFeeBase ?? 3.99;
      }
    }

    // Coupon discount calculation
    let discountAmount = 0;
    let validatedCoupon: any = null;
    if (couponCode) {
      const coupon = await db.coupon.findFirst({
        where: {
          restaurantId: restaurant.id,
          code: couponCode.trim().toUpperCase(),
          isActive: true,
        },
      });

      if (coupon && calculatedSubtotal >= coupon.minOrderAmount) {
        if (coupon.discountType === 'PERCENTAGE') {
          discountAmount = (calculatedSubtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
            discountAmount = coupon.maxDiscountAmount;
          }
        } else {
          discountAmount = Math.min(coupon.discountValue, calculatedSubtotal);
        }
        discountAmount = Math.round(discountAmount * 100) / 100;
        validatedCoupon = coupon;
      }
    }

    // Tax calculation
    const taxableAmount = Math.max(0, calculatedSubtotal - discountAmount);
    const taxRate = restaurant.taxRatePercent || 0;
    const taxAmount = Math.round(((taxableAmount * taxRate) / 100) * 100) / 100;

    // Total
    const totalAmount = Math.round((taxableAmount + deliveryFee + taxAmount) * 100) / 100;

    // Generate Order Number
    const count = await db.order.count({ where: { restaurantId: restaurant.id } });
    const orderNumber = `UB-${1000 + count + 1}`;

    // Get or Create Customer
    let customerRecord = await db.customer.findFirst({
      where: {
        restaurantId: restaurant.id,
        email: customer.email.toLowerCase().trim(),
      },
    });

    if (!customerRecord) {
      customerRecord = await db.customer.create({
        data: {
          restaurantId: restaurant.id,
          name: customer.name.trim(),
          email: customer.email.toLowerCase().trim(),
          phone: customer.phone.trim(),
          isGuest: true,
        },
      });
    }

    const mainBranch = restaurant.branches.find((b) => b.isMainBranch) || restaurant.branches[0];

    // Create Order with Transaction
    const newOrder = await db.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          restaurantId: restaurant.id,
          branchId: mainBranch?.id || null,
          customerId: customerRecord.id,
          orderNumber,
          status: settings?.autoAcceptOrders ? 'CONFIRMED' : 'PENDING',
          orderType,
          customerName: customer.name.trim(),
          customerEmail: customer.email.toLowerCase().trim(),
          customerPhone: customer.phone.trim(),
          deliveryAddress: deliveryAddress ? JSON.stringify(deliveryAddress) : null,
          subtotal: calculatedSubtotal,
          discountAmount,
          deliveryFee,
          taxAmount,
          totalAmount,
          paymentMethod,
          paymentStatus: 'PENDING',
          specialInstructions: specialInstructions || null,
          items: {
            create: verifiedOrderItems.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              productPrice: item.productPrice,
              quantity: item.quantity,
              itemTotal: item.itemTotal,
              specialInstructions: item.specialInstructions,
              modifiers: {
                create: item.modifiers.map((m: any) => ({
                  modifierId: m.modifierId,
                  modifierName: m.modifierName,
                  modifierPrice: m.modifierPrice,
                  quantity: m.quantity,
                })),
              },
            })),
          },
        },
        include: {
          items: {
            include: {
              modifiers: true,
            },
          },
        },
      });

      // Track coupon usage
      if (validatedCoupon) {
        await tx.couponUsage.create({
          data: {
            couponId: validatedCoupon.id,
            orderId: order.id,
            customerId: customerRecord.id,
            discountApplied: discountAmount,
          },
        });
        await tx.coupon.update({
          where: { id: validatedCoupon.id },
          data: { timesUsed: { increment: 1 } },
        });
      }

      // Process payment provider
      const provider = getPaymentProvider(paymentMethod);
      const paymentResult = await provider.processPayment({
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
        currency: restaurant.currency,
        customerEmail: order.customerEmail,
      });

      await tx.payment.create({
        data: {
          orderId: order.id,
          restaurantId: restaurant.id,
          provider: paymentMethod,
          transactionId: paymentResult.transactionId,
          amount: order.totalAmount,
          status: paymentResult.paymentStatus,
        },
      });

      return order;
    });

    // Broadcast Real-Time SSE Event to Admin and KDS
    broadcastTenantOrderEvent(restaurant.id, {
      type: 'ORDER_CREATED',
      restaurantId: restaurant.id,
      order: newOrder,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      orderNumber: newOrder.orderNumber,
      orderId: newOrder.id,
      totalAmount: newOrder.totalAmount,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to place order' },
      { status: 500 }
    );
  }
}