'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Loader2,
  Calendar,
  UtensilsCrossed,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ReportsAdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch('/api/admin/reports');
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const exportCSV = () => {
    if (!data?.orders || data.orders.length === 0) return;

    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Customer Email',
      'Phone',
      'Order Type',
      'Status',
      'Payment Method',
      'Subtotal',
      'Discount',
      'Delivery Fee',
      'Tax',
      'Total Amount',
    ];

    const rows = data.orders.map((o: any) => [
      o.orderNumber,
      new Date(o.createdAt).toISOString(),
      `"${o.customerName}"`,
      o.customerEmail,
      o.customerPhone,
      o.orderType,
      o.status,
      o.paymentMethod,
      o.subtotal.toFixed(2),
      o.discountAmount.toFixed(2),
      o.deliveryFee.toFixed(2),
      o.taxAmount.toFixed(2),
      o.totalAmount.toFixed(2),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `orders-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !data) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const { orders, topProducts } = data;

  const validOrders = orders.filter(
    (o: any) => o.status !== 'CANCELLED' && o.status !== 'REJECTED'
  );
  const totalRevenue = validOrders.reduce((acc: number, o: any) => acc + o.totalAmount, 0);
  const avgTicket = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Sales & Order Analytics
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Review sales volume, product popularity, and download historical reports.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center space-x-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Orders to CSV</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase">Gross Revenue</span>
            <span className="text-2xl font-black text-gray-900 block leading-tight">
              {formatCurrency(totalRevenue)}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-primary flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase">Successful Orders</span>
            <span className="text-2xl font-black text-gray-900 block leading-tight">
              {validOrders.length}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase">Average Ticket</span>
            <span className="text-2xl font-black text-gray-900 block leading-tight">
              {formatCurrency(avgTicket)}
            </span>
          </div>
        </div>
      </div>

      {/* Top Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
            <UtensilsCrossed className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-gray-900">Best Selling Dishes</h2>
          </div>

          <div className="divide-y divide-gray-50 text-xs">
            {topProducts.length === 0 ? (
              <p className="text-gray-400 py-4 text-center">No product data available</p>
            ) : (
              topProducts.map((p: any, idx: number) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-full bg-gray-100 font-bold text-gray-600 flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-gray-800">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900 block">
                      {formatCurrency(p.revenue)}
                    </span>
                    <span className="text-[10px] text-gray-400">{p.quantity} units sold</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order Volume Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-gray-900">Orders Status Breakdown</h2>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { status: 'DELIVERED', label: 'Delivered / Completed', color: 'bg-emerald-500' },
              { status: 'READY', label: 'Ready for Pickup / Courier', color: 'bg-purple-500' },
              { status: 'PREPARING', label: 'Cooking in Kitchen', color: 'bg-blue-500' },
              { status: 'PENDING', label: 'Pending Acceptance', color: 'bg-amber-500' },
              { status: 'CANCELLED', label: 'Cancelled / Rejected', color: 'bg-rose-500' },
            ].map((item) => {
              const count = orders.filter((o: any) => o.status === item.status).length;
              const pct = orders.length > 0 ? (count / orders.length) * 100 : 0;

              return (
                <div key={item.status} className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold text-gray-700">
                    <span>{item.label}</span>
                    <span>
                      {count} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}