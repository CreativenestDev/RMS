'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bike,
  Store,
  Tag,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  CreditCard,
  Banknote,
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { formatCurrency } from '@/lib/utils';
import { RestaurantBranding } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [restaurant, setRestaurant] = useState<RestaurantBranding | null>(null);
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Form State
  const [orderType, setOrderType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Delivery Address
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');

  // Coupon
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Payment & Instructions
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH_ON_DELIVERY');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Load configuration
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/storefront/config');
        const data = await res.json();
        if (data.restaurant) {
          setRestaurant(data.restaurant);
          if (data.restaurant.deliveryZones && data.restaurant.deliveryZones.length > 0) {
            setDeliveryZones(data.restaurant.deliveryZones);
            setSelectedZoneId(data.restaurant.deliveryZones[0].id);
          }
        }
      } catch (e) {
        console.error('Failed to load config', e);
      } finally {
        setLoadingConfig(false);
      }
    }
    loadConfig();
  }, []);

  // Set default payment method based on order type
  useEffect(() => {
    if (orderType === 'PICKUP') {
      setPaymentMethod('PAY_AT_RESTAURANT');
    } else {
      setPaymentMethod('CASH_ON_DELIVERY');
    }
  }, [orderType]);

  const symbol = restaurant?.currencySymbol || '$';

  // Calculations
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxRate = restaurant?.taxRatePercent || 8.0;
  const taxAmount = Math.round(((taxableAmount * taxRate) / 100) * 100) / 100;

  // Delivery fee calculation
  let deliveryFee = 0;
  if (orderType === 'DELIVERY') {
    const freeDeliveryThreshold = restaurant?.settings?.freeDeliveryThreshold ?? 45;
    if (subtotal >= freeDeliveryThreshold) {
      deliveryFee = 0;
    } else {
      const zone = deliveryZones.find((z) => z.id === selectedZoneId);
      deliveryFee = zone ? zone.deliveryFee : (restaurant?.settings?.deliveryFeeBase ?? 3.99);
    }
  }

  const finalTotal = Math.round((taxableAmount + deliveryFee + taxAmount) * 100) / 100;

  // Coupon validator handler
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    setCouponLoading(true);
    setCouponError('');

    try {
      const res = await fetch('/api/storefront/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCodeInput.trim(),
          subtotal,
          restaurantId: restaurant?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || 'Invalid coupon code');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data);
        setCouponCodeInput('');
      }
    } catch (e: any) {
      setCouponError('Failed to validate coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  // Submit Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    // Client validations
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setSubmitError('Please provide your name, email, and phone number.');
      return;
    }

    if (orderType === 'DELIVERY' && (!street.trim() || !city.trim())) {
      setSubmitError('Please fill in your delivery street address and city.');
      return;
    }

    const minOrder = restaurant?.settings?.minOrderAmount ?? 0;
    if (subtotal < minOrder) {
      setSubmitError(`Minimum order amount is ${formatCurrency(minOrder, symbol)}.`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/storefront/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant?.id,
          orderType,
          customer: {
            name: customerName.trim(),
            email: customerEmail.trim(),
            phone: customerPhone.trim(),
          },
          deliveryAddress:
            orderType === 'DELIVERY'
              ? {
                  street: street.trim(),
                  city: city.trim(),
                  postalCode: postalCode.trim(),
                  instructions: deliveryNotes.trim(),
                }
              : null,
          deliveryZoneId: orderType === 'DELIVERY' ? selectedZoneId : null,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            selectedModifiers: i.selectedModifiers,
            specialInstructions: i.specialInstructions,
          })),
          couponCode: appliedCoupon?.code || null,
          paymentMethod,
          specialInstructions: specialInstructions.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      // Success: clear cart and redirect to confirmation
      clearCart();
      router.push(`/order-confirmation/${data.orderNumber}`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setSubmitError(err.message || 'An error occurred while placing your order.');
      setIsSubmitting(false);
    }
  };

  if (loadingConfig || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 text-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="text-sm text-gray-500">
            You must add items to your cart before proceeding to checkout.
          </p>
          <Link
            href="/menu"
            className="inline-block bg-primary text-primary-foreground font-bold text-sm px-6 py-3 rounded-2xl shadow hover:brightness-105 transition-all"
          >
            Browse Delicious Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 py-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/menu" className="flex items-center space-x-1.5 text-xs font-semibold text-gray-600 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Menu</span>
          </Link>
          <span className="font-bold text-base text-gray-900">{restaurant.name} Checkout</span>
          <div className="flex items-center space-x-1 text-xs text-emerald-600 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure SSL</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Details (8 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Order Type Toggle */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-gray-900">1. Fulfillment Method</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrderType('DELIVERY')}
                  className={`p-4 rounded-2xl border flex items-center space-x-3 transition-all ${
                    orderType === 'DELIVERY'
                      ? 'border-primary bg-primary/5 text-primary font-bold shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Bike className="w-5 h-5" />
                  <div className="text-left">
                    <span className="block text-sm">Doorstep Delivery</span>
                    <span className="text-[11px] font-normal text-gray-500">
                      {restaurant.settings?.estimatedPrepTimeMinutes ?? 25} - {(restaurant.settings?.estimatedPrepTimeMinutes ?? 25) + 15} mins
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderType('PICKUP')}
                  className={`p-4 rounded-2xl border flex items-center space-x-3 transition-all ${
                    orderType === 'PICKUP'
                      ? 'border-primary bg-primary/5 text-primary font-bold shadow-xs'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Store className="w-5 h-5" />
                  <div className="text-left">
                    <span className="block text-sm">Store Pickup</span>
                    <span className="text-[11px] font-normal text-gray-500">Ready in 15-20 mins</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Customer Contact */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-gray-900">2. Customer Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Alex Reynolds"
                    className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="hamza@example.com"
                    className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address (if Delivery) */}
            {orderType === 'DELIVERY' && (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-gray-900">3. Delivery Destination</h2>

                {deliveryZones.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Delivery Zone
                    </label>
                    <select
                      value={selectedZoneId}
                      onChange={(e) => setSelectedZoneId(e.target.value)}
                      className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                    >
                      {deliveryZones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name} ({formatCurrency(zone.deliveryFee, symbol)} delivery fee, ~{zone.estimatedDeliveryMinutes} mins)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Street Address & House/Flat # *
                    </label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="e.g. House 42, Street 7, Phase 5 DHA"
                      className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Lahore"
                        className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="54000"
                        className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Delivery Instructions
                    </label>
                    <input
                      type="text"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="Nearby landmark, gate number, call upon arrival..."
                      className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-gray-900">
                {orderType === 'DELIVERY' ? '4. Payment Method' : '3. Payment Method'}
              </h2>

              <div className="space-y-3">
                {/* Cash on Delivery (COD) */}
                <div
                  onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === 'CASH_ON_DELIVERY'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Banknote className="w-5 h-5 text-primary" />
                    <div>
                      <span className="text-sm font-bold text-gray-900 block">
                        Cash on Delivery (COD)
                      </span>
                      <span className="text-xs text-gray-500">
                        Pay cash to rider upon doorstep delivery.
                      </span>
                    </div>
                  </div>
                  {paymentMethod === 'CASH_ON_DELIVERY' && (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  )}
                </div>

                {/* Easypaisa */}
                <div
                  onClick={() => setPaymentMethod('EASYPAISA')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === 'EASYPAISA'
                      ? 'border-emerald-600 bg-emerald-50/40'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                      EP
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-900 block">
                        Easypaisa Mobile Account
                      </span>
                      <span className="text-xs text-gray-500">
                        Pay via Easypaisa Wallet / Direct Transfer (0300-1234567)
                      </span>
                    </div>
                  </div>
                  {paymentMethod === 'EASYPAISA' && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                </div>

                {/* JazzCash */}
                <div
                  onClick={() => setPaymentMethod('JAZZCASH')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === 'JAZZCASH'
                      ? 'border-amber-600 bg-amber-50/40'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded bg-red-600 text-white font-black text-xs flex items-center justify-center">
                      JC
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-900 block">
                        JazzCash Mobile Account
                      </span>
                      <span className="text-xs text-gray-500">
                        Pay via JazzCash Wallet / App (0300-1234567)
                      </span>
                    </div>
                  </div>
                  {paymentMethod === 'JAZZCASH' && (
                    <CheckCircle2 className="w-5 h-5 text-amber-600" />
                  )}
                </div>

                {/* Raast */}
                <div
                  onClick={() => setPaymentMethod('RAAST')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                    paymentMethod === 'RAAST'
                      ? 'border-indigo-600 bg-indigo-50/40'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                      R
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-900 block">
                        Raast Instant Transfer
                      </span>
                      <span className="text-xs text-gray-500">
                        Zero-fee instant transfer via SBP Raast ID
                      </span>
                    </div>
                  </div>
                  {paymentMethod === 'RAAST' && (
                    <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                  )}
                </div>

                {/* Pay at Counter (for Pickup) */}
                {orderType === 'PICKUP' && (
                  <div
                    onClick={() => setPaymentMethod('PAY_AT_RESTAURANT')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                      paymentMethod === 'PAY_AT_RESTAURANT'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Store className="w-5 h-5 text-primary" />
                      <div>
                        <span className="text-sm font-bold text-gray-900 block">
                          Pay at Restaurant Counter
                        </span>
                        <span className="text-xs text-gray-500">
                          Pay with cash or card upon picking up your order.
                        </span>
                      </div>
                    </div>
                    {paymentMethod === 'PAY_AT_RESTAURANT' && (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Kitchen Notes */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-2">
              <label className="block text-sm font-bold text-gray-900">
                Order Notes / Special Requests
              </label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Allergies, extra napkins, contact-free handoff..."
                rows={2}
                className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Right Column: Order Summary (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6 sticky top-24">
              <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
                Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
              </h2>

              {/* Items List */}
              <div className="max-h-60 overflow-y-auto space-y-3 divide-y divide-gray-50">
                {items.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-gray-900">
                        {item.quantity}x {item.name}
                      </span>
                      {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                        <div className="text-gray-500 space-y-0.5 mt-0.5 pl-2 border-l border-gray-200">
                          {item.selectedModifiers.map((m, idx) => (
                            <div key={idx}>+ {m.name}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="font-bold text-gray-900 shrink-0">
                      {formatCurrency(item.itemTotal, symbol)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Code Input */}
              <div className="pt-2 border-t border-gray-100">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="font-bold text-emerald-800 uppercase">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-emerald-700 block">
                          -{formatCurrency(appliedCoupon.discountAmount, symbol)} discount
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(null)}
                      className="text-xs text-rose-600 font-semibold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value)}
                        placeholder="Promo code (e.g. WELCOME10)"
                        className="flex-1 text-xs border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase tracking-wider"
                      />
                      <button
                        type="button"
                        disabled={couponLoading || !couponCodeInput.trim()}
                        onClick={handleApplyCoupon}
                        className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
                      >
                        {couponLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-rose-600 mt-1.5 flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{couponError}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Price Calculations */}
              <div className="pt-4 border-t border-gray-100 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(subtotal, symbol)}
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className="font-semibold">
                      -{formatCurrency(discountAmount, symbol)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Estimated Delivery</span>
                  <span className="font-semibold text-gray-900">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      formatCurrency(deliveryFee, symbol)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Taxes & Fees ({taxRate}%)</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(taxAmount, symbol)}
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                  <span className="text-base font-black text-gray-900">Total Amount</span>
                  <span className="text-2xl font-black text-primary">
                    {formatCurrency(finalTotal, symbol)}
                  </span>
                </div>
              </div>

              {/* Error Box */}
              {submitError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-primary-foreground py-4 px-6 rounded-2xl font-black text-base shadow-xl shadow-primary/25 hover:brightness-105 active:scale-98 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Confirming Order...</span>
                  </>
                ) : (
                  <span>Place Order • {formatCurrency(finalTotal, symbol)}</span>
                )}
              </button>

              <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                By placing your order, you agree to our terms of service and order cancellation policies.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}