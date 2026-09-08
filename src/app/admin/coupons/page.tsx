'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Tag, X, Loader2, Check, AlertCircle, Percent, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function CouponsAdminPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrder, setMinOrder] = useState('0');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const loadCoupons = async () => {
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (data.coupons) setCoupons(data.coupons);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await fetch('/api/admin/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !current }),
      });
      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: !current } : c))
      );
    } catch (e) {}
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) return;

    setCreating(true);
    setError('');

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          discountType,
          discountValue: parseFloat(discountValue),
          minOrderAmount: parseFloat(minOrder) || 0,
          maxDiscountAmount: maxDiscount ? parseFloat(maxDiscount) : null,
          usageLimitTotal: usageLimit ? parseInt(usageLimit) : null,
        }),
      });

      if (!res.ok) throw new Error('Failed to create coupon code');

      await loadCoupons();
      setIsModalOpen(false);
      setCode('');
      setDiscountValue('');
      setMinOrder('0');
      setMaxDiscount('');
      setUsageLimit('');
    } catch (err: any) {
      setError(err.message || 'Error creating coupon');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Coupons & Promotions
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Create discount codes to boost conversions and reward loyal customers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-primary/25 hover:brightness-105 transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Promo Code</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-black text-lg text-gray-900 tracking-wider font-mono">
                  {coupon.code}
                </span>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                    coupon.isActive
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {coupon.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span className="font-bold text-gray-900">
                    {coupon.discountType === 'PERCENTAGE'
                      ? `${coupon.discountValue}% OFF`
                      : `$${coupon.discountValue.toFixed(2)} OFF`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Min Order Spend</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(coupon.minOrderAmount)}
                  </span>
                </div>
                {coupon.maxDiscountAmount && (
                  <div className="flex justify-between">
                    <span>Max Discount Cap</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(coupon.maxDiscountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Usage Count</span>
                  <span className="font-medium text-gray-900">
                    {coupon.timesUsed}{' '}
                    {coupon.usageLimitTotal ? `/ ${coupon.usageLimitTotal}` : 'times'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => toggleActive(coupon.id, coupon.isActive)}
                className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                {coupon.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Create Promo Code</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SUMMER25"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm uppercase tracking-wider font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e: any) => setDiscountType(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === 'PERCENTAGE' ? '15 (for 15%)' : '5.00'}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Min Order Spend ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    placeholder="20"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Max Cap ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    placeholder="Optional cap"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Total Usage Limit
                </label>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="e.g. 100 (leave blank for unlimited)"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-primary text-primary-foreground px-5 py-2 rounded-xl text-xs font-bold shadow hover:brightness-105 transition-all flex items-center space-x-1"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Promo</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}