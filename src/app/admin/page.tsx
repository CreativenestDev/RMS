'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Clock,
  ChefHat,
  PackageCheck,
  CheckCircle2,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  Receipt,
  Bike,
  Store,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch('/api/admin/dashboard');
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error('Failed to load dashboard', e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const { stats, recentOrders } = data;

  return (
    <div className="space-y-8">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time sales performance and live operational metrics.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/orders"
            className="bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-primary/25 hover:brightness-105 transition-all flex items-center space-x-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Open Live Pipeline</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Today&apos;s Revenue
            </span>
            <span className="text-2xl font-black text-gray-900 leading-tight">
              {formatCurrency(stats.todayRevenue)}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium block mt-0.5">
              Total lifetime: {formatCurrency(stats.totalRevenue)}
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-primary flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Today&apos;s Orders
            </span>
            <span className="text-2xl font-black text-gray-900 leading-tight">
              {stats.todayOrderCount}
            </span>
            <span className="text-[11px] text-gray-400 font-medium block mt-0.5">
              All time: {stats.totalOrderCount} orders
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Avg. Ticket Size
            </span>
            <span className="text-2xl font-black text-gray-900 leading-tight">
              {formatCurrency(stats.avgTicket)}
            </span>
            <span className="text-[11px] text-indigo-600 font-medium block mt-0.5">
              Per placed order
            </span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Pending Acceptance
            </span>
            <span className="text-2xl font-black text-gray-900 leading-tight">
              {stats.pendingCount}
            </span>
            <span className="text-[11px] text-amber-600 font-medium block mt-0.5">
              Requires review
            </span>
          </div>
        </div>
      </div>

      {/* Status Pipeline Shortcut Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/admin/orders?status=PENDING"
          className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center justify-between hover:bg-amber-500/15 transition-all group"
        >
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-amber-600" />
            <div>
              <span className="text-xs font-bold text-amber-900 block">Pending</span>
              <span className="text-lg font-black text-amber-700">{stats.pendingCount}</span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>

        <Link
          href="/admin/orders?status=PREPARING"
          className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-center justify-between hover:bg-blue-500/15 transition-all group"
        >
          <div className="flex items-center space-x-3">
            <ChefHat className="w-5 h-5 text-blue-600" />
            <div>
              <span className="text-xs font-bold text-blue-900 block">Preparing</span>
              <span className="text-lg font-black text-blue-700">{stats.preparingCount}</span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>

        <Link
          href="/admin/orders?status=READY"
          className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between hover:bg-emerald-500/15 transition-all group"
        >
          <div className="flex items-center space-x-3">
            <PackageCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <span className="text-xs font-bold text-emerald-900 block">Ready</span>
              <span className="text-lg font-black text-emerald-700">{stats.readyCount}</span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>

        <Link
          href="/admin/orders?status=DELIVERED"
          className="bg-slate-500/10 border border-slate-500/20 p-4 rounded-2xl flex items-center justify-between hover:bg-slate-500/15 transition-all group"
        >
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-slate-700" />
            <div>
              <span className="text-xs font-bold text-slate-900 block">Delivered</span>
              <span className="text-lg font-black text-slate-700">{stats.completedCount}</span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-200/70 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-gray-900">Recent Customer Orders</h2>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-primary hover:underline flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50/80 uppercase tracking-wider text-[10px] font-bold text-gray-400 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3.5">Order</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Items</th>
                <th className="px-6 py-3.5">Total</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-400">
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order: any) => {
                  let statusBadge = 'bg-gray-100 text-gray-700';
                  if (order.status === 'PENDING') statusBadge = 'bg-amber-100 text-amber-800';
                  if (order.status === 'CONFIRMED' || order.status === 'PREPARING')
                    statusBadge = 'bg-blue-100 text-blue-800';
                  if (order.status === 'READY') statusBadge = 'bg-purple-100 text-purple-800';
                  if (order.status === 'OUT_FOR_DELIVERY')
                    statusBadge = 'bg-orange-100 text-orange-800';
                  if (order.status === 'DELIVERED')
                    statusBadge = 'bg-emerald-100 text-emerald-800';
                  if (order.status === 'CANCELLED' || order.status === 'REJECTED')
                    statusBadge = 'bg-rose-100 text-rose-800';

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">
                        <Link
                          href={`/track/${order.orderNumber}`}
                          target="_blank"
                          className="hover:text-primary transition-colors"
                        >
                          #{order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900 block">
                          {order.customerName}
                        </span>
                        <span className="text-[11px] text-gray-400">{order.customerPhone}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center space-x-1 font-semibold text-gray-700">
                          {order.orderType === 'DELIVERY' ? (
                            <Bike className="w-3.5 h-3.5 text-primary" />
                          ) : (
                            <Store className="w-3.5 h-3.5 text-primary" />
                          )}
                          <span className="capitalize">{order.orderType.toLowerCase()}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${statusBadge}`}
                        >
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{formatDate(order.createdAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}