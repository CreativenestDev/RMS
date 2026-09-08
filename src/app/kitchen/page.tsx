'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Flame,
  Check,
} from 'lucide-react';
import { soundManager } from '@/lib/sound';

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'CONFIRMED' | 'PREPARING' | 'READY'>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock ticker for elapsed time recalculation
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  const loadKitchenOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (data.orders) {
        // Filter only kitchen relevant statuses
        setOrders(
          data.orders.filter((o: any) =>
            ['CONFIRMED', 'PREPARING', 'READY'].includes(o.status)
          )
        );
      }
    } catch (e) {
      console.error('Failed to load kitchen orders', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKitchenOrders();
  }, []);

  // Real-time SSE listener
  useEffect(() => {
    const eventSource = new EventSource('/api/admin/orders/stream');

    eventSource.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);

        if (payload.type === 'ORDER_CREATED') {
          if (soundEnabled) soundManager.playNewOrderChime();
          loadKitchenOrders();
        } else if (payload.type === 'STATUS_CHANGED') {
          if (soundEnabled) soundManager.playStatusChangeBeep();
          setOrders((prev) => {
            const updated = payload.order;
            if (['CONFIRMED', 'PREPARING', 'READY'].includes(updated.status)) {
              const exists = prev.some((o) => o.id === updated.id);
              if (exists) {
                return prev.map((o) => (o.id === updated.id ? updated : o));
              } else {
                return [updated, ...prev];
              }
            } else {
              // Order moved to DELIVERED or CANCELLED, remove from KDS
              return prev.filter((o) => o.id !== updated.id);
            }
          });
        }
      } catch (err) {}
    };

    return () => {
      eventSource.close();
    };
  }, [soundEnabled]);

  // Bump order status
  const handleBumpOrder = async (orderId: string, nextStatus: string) => {
    setActionLoadingId(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        if (nextStatus === 'DELIVERED' || nextStatus === 'OUT_FOR_DELIVERY') {
          setOrders((prev) => prev.filter((o) => o.id !== orderId));
        } else {
          setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? data.order : o))
          );
        }
      }
    } catch (e) {
      console.error('Bump failed', e);
    } finally {
      setActionLoadingId(null);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        <p className="text-sm font-bold tracking-wider uppercase text-slate-400">
          Initializing Kitchen Display System (KDS)...
        </p>
      </div>
    );
  }

  const filteredOrders = orders.filter((o) => {
    if (filter === 'ALL') return true;
    return o.status === filter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none">
      {/* KDS Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            title="Back to Manager Admin"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white leading-tight">
                KITCHEN DISPLAY SYSTEM (KDS)
              </h1>
              <span className="text-[11px] text-amber-400 font-semibold tracking-wide uppercase">
                {orders.length} Active Cooking Tickets
              </span>
            </div>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="hidden md:flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(['ALL', 'CONFIRMED', 'PREPARING', 'READY'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                filter === tab
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'CONFIRMED' ? 'New' : tab}
            </button>
          ))}
        </div>

        {/* Action controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              if (!soundEnabled) soundManager.playNewOrderChime();
              setSoundEnabled(!soundEnabled);
            }}
            className={`p-2.5 rounded-xl border transition-all ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-amber-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title="Toggle ticket sound"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl transition-colors"
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Ticket Board */}
      <main className="flex-1 p-6 overflow-y-auto">
        {filteredOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-24 space-y-4">
            <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-white">All Clear, Chef!</h2>
            <p className="text-xs text-slate-400 max-w-sm">
              There are no active orders currently awaiting preparation. New orders will automatically appear here with a chime sound alert.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {filteredOrders.map((order) => {
              // Calculate elapsed minutes
              const elapsedMinutes = Math.floor(
                (currentTime.getTime() - new Date(order.createdAt).getTime()) / 60000
              );

              let urgencyColor = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400';
              if (elapsedMinutes >= 10 && elapsedMinutes < 20) {
                urgencyColor = 'border-amber-500/60 bg-amber-500/10 text-amber-400';
              } else if (elapsedMinutes >= 20) {
                urgencyColor = 'border-rose-500/80 bg-rose-500/15 text-rose-400 animate-pulse';
              }

              return (
                <div
                  key={order.id}
                  className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Ticket Header */}
                    <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-xl font-black text-white block leading-tight">
                          #{order.orderNumber}
                        </span>
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                          {order.orderType}
                        </span>
                      </div>

                      {/* Elapsed Timer Urgency Badge */}
                      <div
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-black ${urgencyColor}`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{elapsedMinutes}m</span>
                      </div>
                    </div>

                    {/* Customer & Notes */}
                    <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-slate-200">{order.customerName}</span>
                      <span className="text-[11px] font-bold text-amber-400 uppercase">
                        {order.status}
                      </span>
                    </div>

                    {/* Order Items */}
                    <div className="p-4 space-y-4">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="border-b border-slate-800/60 pb-3 last:border-0 last:pb-0">
                          <div className="flex items-start space-x-2.5">
                            <span className="text-lg font-black text-amber-400 bg-amber-500/10 w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
                              {item.quantity}
                            </span>
                            <div>
                              <span className="text-base font-bold text-white leading-snug block">
                                {item.productName}
                              </span>

                              {/* Modifier breakdown */}
                              {item.modifiers && item.modifiers.length > 0 && (
                                <div className="mt-1 space-y-0.5">
                                  {item.modifiers.map((m: any) => (
                                    <span
                                      key={m.id}
                                      className="inline-block bg-slate-800 text-amber-300 text-xs font-bold px-2 py-0.5 rounded-md mr-1 mb-1 border border-slate-700/60"
                                    >
                                      + {m.modifierName}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {item.specialInstructions && (
                                <p className="text-xs text-rose-400 font-bold italic mt-1 bg-rose-950/40 p-1.5 rounded border border-rose-900/40">
                                  ⚠️ &quot;{item.specialInstructions}&quot;
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {order.specialInstructions && (
                        <div className="p-2.5 bg-amber-950/30 border border-amber-900/50 rounded-xl text-xs text-amber-300 font-bold">
                          Special Note: {order.specialInstructions}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* BUMP Action Footer */}
                  <div className="p-4 bg-slate-950 border-t border-slate-800">
                    {order.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleBumpOrder(order.id, 'PREPARING')}
                        disabled={actionLoadingId === order.id}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-4 rounded-2xl text-sm shadow-lg shadow-blue-600/30 active:scale-98 transition-all flex items-center justify-center space-x-2"
                      >
                        <Flame className="w-5 h-5" />
                        <span>START PREPARING</span>
                      </button>
                    )}

                    {order.status === 'PREPARING' && (
                      <button
                        onClick={() => handleBumpOrder(order.id, 'READY')}
                        disabled={actionLoadingId === order.id}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-4 px-4 rounded-2xl text-sm shadow-lg shadow-purple-600/30 active:scale-98 transition-all flex items-center justify-center space-x-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>MARK READY</span>
                      </button>
                    )}

                    {order.status === 'READY' && (
                      <button
                        onClick={() =>
                          handleBumpOrder(
                            order.id,
                            order.orderType === 'DELIVERY' ? 'OUT_FOR_DELIVERY' : 'DELIVERED'
                          )
                        }
                        disabled={actionLoadingId === order.id}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-4 rounded-2xl text-sm shadow-lg shadow-emerald-600/30 active:scale-98 transition-all flex items-center justify-center space-x-2"
                      >
                        <Check className="w-5 h-5" />
                        <span>BUMP / COMPLETED</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}