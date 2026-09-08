'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Clock,
  Bike,
  Store,
  Check,
  ChevronRight,
  Printer,
  X,
  AlertCircle,
  Volume2,
  ChefHat,
  PackageCheck,
  CheckCircle2,
  Filter,
  Columns,
  List,
  Loader2,
  Phone,
} from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { soundManager } from '@/lib/sound';

const STATUS_COLUMNS = [
  { id: 'PENDING', label: 'New Orders', color: 'border-amber-400 bg-amber-50/40 text-amber-900', badge: 'bg-amber-100 text-amber-800' },
  { id: 'CONFIRMED', label: 'Confirmed', color: 'border-blue-400 bg-blue-50/40 text-blue-900', badge: 'bg-blue-100 text-blue-800' },
  { id: 'PREPARING', label: 'Preparing', color: 'border-indigo-400 bg-indigo-50/40 text-indigo-900', badge: 'bg-indigo-100 text-indigo-800' },
  { id: 'READY', label: 'Ready for Handoff', color: 'border-purple-400 bg-purple-50/40 text-purple-900', badge: 'bg-purple-100 text-purple-800' },
  { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', color: 'border-orange-400 bg-orange-50/40 text-orange-900', badge: 'bg-orange-100 text-orange-800' },
  { id: 'DELIVERED', label: 'Delivered / Completed', color: 'border-emerald-400 bg-emerald-50/40 text-emerald-900', badge: 'bg-emerald-100 text-emerald-800' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [filterStatus, setFilterStatus] = useState<string>('ACTIVE');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [newOrderAlert, setNewOrderAlert] = useState<any>(null);

  // Fetch initial orders
  const loadOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error('Failed to load orders', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Connect to live SSE order stream
  useEffect(() => {
    const eventSource = new EventSource('/api/admin/orders/stream');

    eventSource.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);

        if (payload.type === 'ORDER_CREATED') {
          soundManager.playNewOrderChime();
          setNewOrderAlert(payload.order);
          setOrders((prev) => [payload.order, ...prev.filter((o) => o.id !== payload.order.id)]);
          // Clear alert toast after 8 seconds
          setTimeout(() => setNewOrderAlert(null), 8000);
        } else if (payload.type === 'STATUS_CHANGED') {
          soundManager.playStatusChangeBeep();
          setOrders((prev) =>
            prev.map((o) => (o.id === payload.order.id ? { ...o, ...payload.order } : o))
          );
        }
      } catch (err) {}
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Order status transition handler
  const handleUpdateStatus = async (orderId: string, nextStatus: string, cancelReason?: string) => {
    setActionLoadingId(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: nextStatus, cancelReason }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, ...data.order } : o))
        );
      }
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const printTicket = (order: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Order Ticket #${order.orderNumber}</title>
          <style>
            body { font-family: monospace; padding: 20px; max-width: 320px; font-size: 13px; }
            h1 { font-size: 18px; margin-bottom: 5px; text-align: center; }
            .meta { border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .item { display: flex; justify-content: space-between; margin-bottom: 6px; }
            .mod { font-size: 11px; padding-left: 10px; }
            .total { border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; font-weight: bold; font-size: 15px; }
          </style>
        </head>
        <body>
          <h1>${order.orderNumber}</h1>
          <div class="meta">
            <div>Type: <b>${order.orderType}</b></div>
            <div>Customer: ${order.customerName} (${order.customerPhone})</div>
            <div>Date: ${new Date(order.createdAt).toLocaleString()}</div>
          </div>
          <div>
            ${order.items
              .map(
                (i: any) => `
                <div class="item">
                  <span>${i.quantity}x ${i.productName}</span>
                  <span>$${i.itemTotal.toFixed(2)}</span>
                </div>
                ${(i.modifiers || [])
                  .map((m: any) => `<div class="mod">+ ${m.modifierName}</div>`)
                  .join('')}
              `
              )
              .join('')}
          </div>
          <div class="total">
            Total: $${order.totalAmount.toFixed(2)}
          </div>
          <p style="text-align:center; margin-top:20px;">*** KITCHEN COPY ***</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'ACTIVE') {
      return !['DELIVERED', 'CANCELLED', 'REJECTED'].includes(o.status);
    }
    if (filterStatus === 'COMPLETED') {
      return o.status === 'DELIVERED';
    }
    if (filterStatus === 'CANCELLED') {
      return ['CANCELLED', 'REJECTED'].includes(o.status);
    }
    if (filterStatus === 'ALL') {
      return true;
    }
    return o.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* New Order Toast Alert */}
      {newOrderAlert && (
        <div className="bg-primary text-primary-foreground p-4 rounded-2xl shadow-xl flex items-center justify-between animate-bounce">
          <div className="flex items-center space-x-3">
            <ShoppingBag className="w-6 h-6" />
            <div>
              <span className="font-black text-sm block">
                🔔 NEW INCOMING ORDER: #{newOrderAlert.orderNumber}
              </span>
              <span className="text-xs opacity-90">
                {newOrderAlert.customerName} placed an order ({formatCurrency(newOrderAlert.totalAmount)})
              </span>
            </div>
          </div>
          <button
            onClick={() => setNewOrderAlert(null)}
            className="p-1.5 hover:bg-white/20 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Live Orders Pipeline
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time multi-stage status management with audio chime alerts.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View mode toggle */}
          <div className="bg-gray-100 p-1 rounded-xl flex items-center space-x-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          {/* Test Sound Button */}
          <button
            onClick={() => soundManager.playNewOrderChime()}
            className="p-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5"
            title="Test audio chime"
          >
            <Volume2 className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Test Chime</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
        {[
          { id: 'ACTIVE', label: 'Active Pipeline' },
          { id: 'PENDING', label: 'Pending' },
          { id: 'PREPARING', label: 'Cooking' },
          { id: 'READY', label: 'Ready' },
          { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
          { id: 'COMPLETED', label: 'Completed' },
          { id: 'CANCELLED', label: 'Cancelled' },
          { id: 'ALL', label: 'All Orders' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterStatus === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-5 overflow-x-auto pb-6">
          {STATUS_COLUMNS.slice(0, 5).map((col) => {
            const colOrders = orders.filter((o) => o.status === col.id);

            return (
              <div
                key={col.id}
                className="bg-gray-100/70 rounded-3xl p-4 flex flex-col min-w-[280px] max-h-[80vh]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full border-2 ${col.color}`}
                    />
                    <h3 className="font-black text-xs uppercase tracking-wider text-gray-700">
                      {col.label}
                    </h3>
                  </div>
                  <span className="bg-white border border-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full shadow-xs">
                    {colOrders.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                  {colOrders.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400 font-medium">
                      No orders
                    </div>
                  ) : (
                    colOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex flex-col space-y-3"
                      >
                        {/* Top info */}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-black text-sm text-gray-900">
                                #{order.orderNumber}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  order.orderType === 'DELIVERY'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'bg-emerald-50 text-emerald-700'
                                }`}
                              >
                                {order.orderType}
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-400 block mt-0.5">
                              {formatTime(order.createdAt)}
                            </span>
                          </div>

                          <button
                            onClick={() => printTicket(order)}
                            className="p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100 transition-colors"
                            title="Print kitchen ticket"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Customer */}
                        <div className="text-xs border-t border-gray-50 pt-2">
                          <span className="font-bold text-gray-900 block">
                            {order.customerName}
                          </span>
                          <span className="text-gray-400 text-[11px] flex items-center space-x-1 mt-0.5">
                            <Phone className="w-3 h-3" />
                            <span>{order.customerPhone}</span>
                          </span>
                        </div>

                        {/* Items list */}
                        <div className="space-y-1 text-xs text-gray-600 bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
                          {order.items.map((i: any) => (
                            <div key={i.id} className="leading-snug">
                              <span className="font-bold text-gray-800">
                                {i.quantity}x {i.productName}
                              </span>
                              {i.modifiers && i.modifiers.length > 0 && (
                                <div className="text-[10px] text-gray-400 pl-2">
                                  {i.modifiers.map((m: any) => m.modifierName).join(', ')}
                                </div>
                              )}
                            </div>
                          ))}
                          {order.specialInstructions && (
                            <p className="text-[11px] text-primary italic font-medium pt-1">
                              &quot;{order.specialInstructions}&quot;
                            </p>
                          )}
                        </div>

                        {/* Price & Primary Action */}
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                          <span className="font-black text-sm text-gray-900">
                            {formatCurrency(order.totalAmount)}
                          </span>

                          {/* Pipeline Action Buttons */}
                          {order.status === 'PENDING' && (
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'REJECTED', 'Kitchen at capacity')}
                                disabled={actionLoadingId === order.id}
                                className="px-2 py-1 bg-gray-100 hover:bg-rose-50 text-gray-600 hover:text-rose-600 rounded-lg text-xs font-bold transition-colors"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                                disabled={actionLoadingId === order.id}
                                className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-xs font-bold shadow hover:brightness-105 transition-all"
                              >
                                Accept
                              </button>
                            </div>
                          )}

                          {order.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                              disabled={actionLoadingId === order.id}
                              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold shadow hover:bg-blue-500 transition-all flex items-center space-x-1"
                            >
                              <span>Start Prep</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {order.status === 'PREPARING' && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'READY')}
                              disabled={actionLoadingId === order.id}
                              className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold shadow hover:bg-purple-500 transition-all flex items-center space-x-1"
                            >
                              <span>Mark Ready</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {order.status === 'READY' && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(
                                  order.id,
                                  order.orderType === 'DELIVERY' ? 'OUT_FOR_DELIVERY' : 'DELIVERED'
                                )
                              }
                              disabled={actionLoadingId === order.id}
                              className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow hover:bg-emerald-500 transition-all flex items-center space-x-1"
                            >
                              <span>
                                {order.orderType === 'DELIVERY' ? 'Out for Delivery' : 'Complete'}
                              </span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {order.status === 'OUT_FOR_DELIVERY' && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                              disabled={actionLoadingId === order.id}
                              className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow hover:bg-emerald-500 transition-all flex items-center space-x-1"
                            >
                              <span>Mark Delivered</span>
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Tabular List View */
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 uppercase tracking-wider text-[10px] font-bold text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5">Order</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Items</th>
                  <th className="px-6 py-3.5">Total</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                      No orders matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">
                        <Link
                          href={`/track/${order.orderNumber}`}
                          target="_blank"
                          className="hover:text-primary transition-colors"
                        >
                          #{order.orderNumber}
                        </Link>
                        <span className="block text-[10px] font-normal text-gray-400">
                          {formatTime(order.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900 block">{order.customerName}</span>
                        <span className="text-[11px] text-gray-400">{order.customerPhone}</span>
                      </td>
                      <td className="px-6 py-4 capitalize font-medium">{order.orderType.toLowerCase()}</td>
                      <td className="px-6 py-4">
                        {order.items.map((i: any) => `${i.quantity}x ${i.productName}`).join(', ')}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gray-100 text-gray-800">
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {order.status === 'PENDING' && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                              className="px-2.5 py-1 bg-primary text-primary-foreground rounded-lg font-bold"
                            >
                              Accept
                            </button>
                          )}
                          {order.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                              className="px-2.5 py-1 bg-blue-600 text-white rounded-lg font-bold"
                            >
                              Prep
                            </button>
                          )}
                          {order.status === 'PREPARING' && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'READY')}
                              className="px-2.5 py-1 bg-purple-600 text-white rounded-lg font-bold"
                            >
                              Ready
                            </button>
                          )}
                          <button
                            onClick={() => printTicket(order)}
                            className="p-1 text-gray-400 hover:text-gray-700 rounded"
                            title="Print ticket"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}