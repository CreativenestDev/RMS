import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Clock, MapPin, ArrowRight, Phone, Receipt } from 'lucide-react';
import { db } from '@/lib/db';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  const order = await db.order.findUnique({
    where: { orderNumber },
    include: {
      restaurant: true,
      items: {
        include: {
          modifiers: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const symbol = order.restaurant.currencySymbol || '$';
  let addressData: any = null;
  if (order.deliveryAddress) {
    try {
      addressData = JSON.parse(order.deliveryAddress);
    } catch {}
  }

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-500 text-white p-8 text-center relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-1">
              <CheckCircle2 className="w-10 h-10 text-white stroke-[2.5]" />
            </div>
            <span className="text-xs font-bold tracking-wider uppercase opacity-90">
              Order Confirmed & Received
            </span>
            <h1 className="text-3xl font-black tracking-tight">{order.orderNumber}</h1>
            <p className="text-xs opacity-80 pt-1">
              Thank you, {order.customerName}! We&apos;ve sent receipt details to {order.customerEmail}.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Real-time Tracking Call to Action */}
          <Link
            href={`/track/${order.orderNumber}`}
            className="w-full bg-primary text-primary-foreground py-4 px-6 rounded-2xl font-black text-base shadow-xl shadow-primary/25 hover:brightness-105 active:scale-98 transition-all flex items-center justify-center space-x-2 text-center"
          >
            <span>Track Live Order Status</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs">
            <div>
              <span className="block text-gray-400 font-semibold mb-0.5">Order Type</span>
              <span className="font-bold text-gray-900 capitalize">
                {order.orderType.toLowerCase()}
              </span>
            </div>
            <div>
              <span className="block text-gray-400 font-semibold mb-0.5">Payment Method</span>
              <span className="font-bold text-gray-900">
                {order.paymentMethod === 'CASH_ON_DELIVERY'
                  ? 'Cash on Delivery'
                  : 'Pay at Counter'}
              </span>
            </div>
            <div>
              <span className="block text-gray-400 font-semibold mb-0.5">Estimated Time</span>
              <span className="font-bold text-gray-900 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>30 - 45 minutes</span>
              </span>
            </div>
            <div>
              <span className="block text-gray-400 font-semibold mb-0.5">Date & Time</span>
              <span className="font-bold text-gray-900">{formatDate(order.createdAt)}</span>
            </div>
          </div>

          {/* Delivery Address (if applicable) */}
          {addressData && (
            <div className="border border-gray-100 p-4 rounded-2xl flex items-start space-x-3 text-xs">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gray-900 block">Delivery Address</span>
                <span className="text-gray-600">
                  {addressData.street}, {addressData.city} {addressData.postalCode}
                </span>
                {addressData.instructions && (
                  <p className="text-gray-400 mt-0.5 italic">Note: {addressData.instructions}</p>
                )}
              </div>
            </div>
          )}

          {/* Items Receipt */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Receipt className="w-3.5 h-3.5" />
              <span>Receipt Items</span>
            </h3>

            <div className="divide-y divide-gray-100 text-xs">
              {order.items.map((item) => (
                <div key={item.id} className="py-2.5 flex justify-between gap-3">
                  <div>
                    <span className="font-bold text-gray-900">
                      {item.quantity}x {item.productName}
                    </span>
                    {item.modifiers && item.modifiers.length > 0 && (
                      <div className="text-gray-500 pl-2 space-y-0.5">
                        {item.modifiers.map((m) => (
                          <div key={m.id}>+ {m.modifierName}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="font-semibold text-gray-900 shrink-0">
                    {formatCurrency(item.itemTotal, symbol)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-3 border-t border-gray-100 space-y-1 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal, symbol)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discountAmount, symbol)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>Delivery Fee</span>
                <span>{formatCurrency(order.deliveryFee, symbol)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Tax</span>
                <span>{formatCurrency(order.taxAmount, symbol)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-100">
                <span>Total Amount Paid / Due</span>
                <span className="text-primary">{formatCurrency(order.totalAmount, symbol)}</span>
              </div>
            </div>
          </div>

          {/* Footer Back Link */}
          <div className="pt-2 text-center">
            <Link
              href="/"
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
            >
              Return to Storefront Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}