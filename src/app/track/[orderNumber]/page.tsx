'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  Bike,
  ChefHat,
  PackageCheck,
  Phone,
  ArrowLeft,
  AlertTriangle,
  Loader2,
  Receipt,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { OrderStatus } from '@/types';

const PIPELINE_STEPS = [
  { status: 'PENDING', label: 'Order Received', desc: 'Awaiting restaurant confirmation', icon: Clock },
  { status: 'CONFIRMED', label: 'Confirmed', desc: 'Order approved by manager', icon: CheckCircle2 },
  { status: 'PREPARING', label: 'In the Kitchen', desc: 'Chef is cooking your fresh order', icon: ChefHat },
  { status: 'READY', label: 'Packed & Ready', desc: 'Ready for courier / counter pickup', icon: PackageCheck },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Courier is en route to you', icon: Bike },
  { status: 'DELIVERED', label: 'Delivered', desc: 'Order completed. Enjoy your food!', icon: CheckCircle2 },
];

function getStepIndex(status: string): number {
  switch (status) {
    case 'PENDING':
      return 0;
    case 'CONFIRMED':
      return 1;
    case 'PREPARING':
      return 2;
    case 'READY':
      return 3;
    case 'OUT_FOR_DELIVERY':
      return 4;
    case 'DELIVERED':
      return 5;
    default:
      return 0;
  }
}

export default function OrderTrackingPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liveConnected, setLiveConnected] = useState(false);

  // Fetch initial order details
  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/storefront/orders/${orderNumber}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Order not found');
        } else {
          setOrder(data.order);
        }
      } catch (err: any) {
        setError('Failed to load order');
      } finally {
        setLoading(false);
      }
    }

    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  // Connect to SSE Live Stream
  useEffect(() => {
    if (!orderNumber) return;

    const eventSource = new EventSource(
      `/api/storefront/orders/${orderNumber}/stream`
    );

    eventSource.onopen = () => {
      setLiveConnected(true);
    };

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'STATUS_CHANGED' || data.type === 'ORDER_UPDATED') {
          if (data.order) {
            setOrder((prev: any) => ({ ...prev, ...data.order }));
          }
        }
      } catch (err) {
        // Heartbeat or malformed data
      }
    };

    eventSource.onerror = () => {
      setLiveConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-semibold text-gray-600">Connecting to live order tracker...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-gray-900">{error || 'Order not found'}</h2>
          <Link
            href="/"
            className="inline-block bg-primary text-primary-foreground font-bold text-sm px-6 py-3 rounded-2xl shadow hover:brightness-105"
          >
            Return to Storefront
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === 'CANCELLED' || order.status === 'REJECTED';
  const symbol = order.restaurant?.currencySymbol || '$';

  return (
    <div className="min-h-screen bg-[#fafafa] pb-16">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-4 shadow-xs sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-1.5 text-xs font-semibold text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Storefront</span>
          </Link>

          <div className="flex items-center space-x-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                liveConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-xs font-bold text-gray-700">
              {liveConnected ? 'Live Tracking Active' : 'Connecting Stream...'}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Status Card Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <div className="flex items-center space-x-2 text-xs text-primary font-bold uppercase tracking-wider mb-1">
                <span>{order.restaurant?.name}</span>
                <span>•</span>
                <span>{order.orderType}</span>
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                Order #{order.orderNumber}
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>

            {order.restaurant?.phone && (
              <a
                href={`tel:${order.restaurant.phone}`}
                className="inline-flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors self-start sm:self-auto"
              >
                <Phone className="w-4 h-4 text-primary" />
                <span>Call Restaurant</span>
              </a>
            )}
          </div>

          {/* Cancellation State */}
          {isCancelled ? (
            <div className="mt-6 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2">
              <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
              <h3 className="text-lg font-bold text-rose-900">
                Order {order.status === 'REJECTED' ? 'Declined by Restaurant' : 'Cancelled'}
              </h3>
              {order.cancelReason && (
                <p className="text-xs text-rose-700">Reason: {order.cancelReason}</p>
              )}
            </div>
          ) : (
            /* Visual Progress Pipeline */
            <div className="mt-8 space-y-8">
              <div className="relative">
                {/* Horizontal progress background */}
                <div className="hidden sm:block absolute top-1/2 left-6 right-6 h-1 -translate-y-1/2 bg-gray-100 -z-0" />
                <div
                  className="hidden sm:block absolute top-1/2 left-6 h-1 -translate-y-1/2 bg-primary transition-all duration-700 -z-0"
                  style={{
                    width: `${Math.min(100, (currentStep / (PIPELINE_STEPS.length - 1)) * 100)}%`,
                  }}
                />

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
                  {PIPELINE_STEPS.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isDone = currentStep >= idx;
                    const isCurrent = currentStep === idx;

                    return (
                      <div
                        key={step.status}
                        className={`flex flex-col items-center text-center p-3 rounded-2xl transition-all ${
                          isCurrent
                            ? 'bg-primary/10 border-2 border-primary shadow-xs'
                            : isDone
                            ? 'bg-emerald-50/70 border border-emerald-200/60'
                            : 'bg-gray-50 border border-gray-100 opacity-60'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow-xs transition-transform ${
                            isCurrent
                              ? 'bg-primary text-white scale-110'
                              : isDone
                              ? 'bg-emerald-500 text-white'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          <StepIcon className="w-5 h-5" />
                        </div>
                        <span
                          className={`text-xs font-bold leading-tight ${
                            isCurrent ? 'text-primary' : isDone ? 'text-gray-900' : 'text-gray-500'
                          }`}
                        >
                          {step.label}
                        </span>
                        <span className="text-[10px] text-gray-400 mt-0.5 line-clamp-2 leading-tight">
                          {step.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Current Active Status Headline */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-primary animate-ping" />
                <div className="text-xs">
                  <span className="font-bold text-gray-900">Current Status: </span>
                  <span className="text-primary font-extrabold uppercase">
                    {order.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-gray-500 block sm:inline sm:ml-2">
                    — {PIPELINE_STEPS[currentStep]?.desc}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Details Accordion / Summary */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-md space-y-6">
          <h2 className="text-base font-bold text-gray-900 flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-primary" />
            <span>Order Summary & Receipt</span>
          </h2>

          <div className="divide-y divide-gray-100 text-xs">
            {order.items.map((item: any) => (
              <div key={item.id} className="py-3 flex justify-between gap-4">
                <div>
                  <span className="font-bold text-gray-900 text-sm">
                    {item.quantity}x {item.productName}
                  </span>
                  {item.modifiers && item.modifiers.length > 0 && (
                    <div className="text-gray-500 mt-1 pl-2 space-y-0.5">
                      {item.modifiers.map((m: any) => (
                        <div key={m.id}>+ {m.modifierName}</div>
                      ))}
                    </div>
                  )}
                  {item.specialInstructions && (
                    <p className="text-gray-400 mt-1 italic">&quot;{item.specialInstructions}&quot;</p>
                  )}
                </div>
                <span className="font-bold text-gray-900 shrink-0 text-sm">
                  {formatCurrency(item.itemTotal, symbol)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold">{formatCurrency(order.subtotal, symbol)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount Applied</span>
                <span className="font-semibold">-{formatCurrency(order.discountAmount, symbol)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span className="font-semibold">{formatCurrency(order.deliveryFee, symbol)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax</span>
              <span className="font-semibold">{formatCurrency(order.taxAmount, symbol)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-100">
              <span>Total Amount</span>
              <span className="text-primary">{formatCurrency(order.totalAmount, symbol)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}