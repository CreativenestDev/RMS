'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Palette,
  Store,
  Clock,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function SettingsAdminPage() {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [taxRatePercent, setTaxRatePercent] = useState('8.5');
  const [primaryColor, setPrimaryColor] = useState('#ea580c');
  const [secondaryColor, setSecondaryColor] = useState('#0f172a');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  // Operational Settings
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [noticeBanner, setNoticeBanner] = useState('');
  const [minOrder, setMinOrder] = useState('15');
  const [prepTime, setPrepTime] = useState('20');
  const [deliveryFeeBase, setDeliveryFeeBase] = useState('3.99');
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('45');
  const [autoAccept, setAutoAccept] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.restaurant) {
          const r = data.restaurant;
          setRestaurant(r);
          setName(r.name || '');
          setPhone(r.phone || '');
          setEmail(r.email || '');
          setAddress(r.address || '');
          setCurrencySymbol(r.currencySymbol || '$');
          setTaxRatePercent(r.taxRatePercent?.toString() || '8.5');
          setPrimaryColor(r.primaryColor || '#ea580c');
          setSecondaryColor(r.secondaryColor || '#0f172a');
          setLogoUrl(r.logoUrl || '');
          setCoverUrl(r.coverUrl || '');

          if (r.settings) {
            setIsStoreOpen(r.settings.isStoreOpen ?? true);
            setNoticeBanner(r.settings.noticeBanner || '');
            setMinOrder(r.settings.minOrderAmount?.toString() || '15');
            setPrepTime(r.settings.estimatedPrepTimeMinutes?.toString() || '20');
            setDeliveryFeeBase(r.settings.deliveryFeeBase?.toString() || '3.99');
            setFreeDeliveryThreshold(r.settings.freeDeliveryThreshold?.toString() || '45');
            setAutoAccept(r.settings.autoAcceptOrders ?? false);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          address,
          currencySymbol,
          taxRatePercent,
          primaryColor,
          secondaryColor,
          logoUrl,
          coverUrl,
          settings: {
            isStoreOpen,
            noticeBanner,
            minOrderAmount: minOrder,
            estimatedPrepTimeMinutes: prepTime,
            deliveryFeeBase,
            freeDeliveryThreshold,
            autoAcceptOrders: autoAccept,
          },
        }),
      });

      if (!res.ok) throw new Error('Failed to save settings');

      setSuccessMsg('Settings and white-label branding updated successfully!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving settings');
    } finally {
      setSaving(false);
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
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Settings & White-Label Branding
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Customize your storefront brand colors, logo, operating rules, and delivery fees.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-bold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: White-Label Visual Branding */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-6">
          <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-gray-900">1. Brand Identity & Theming</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Restaurant Display Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                required
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>

            {/* Color Pickers */}
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Primary Brand Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-gray-200 p-0.5"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-32 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono"
                />
                <span
                  className="px-3 py-1.5 rounded-lg text-white font-bold text-xs shadow-xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  Live Preview
                </span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Secondary Slate Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-gray-200 p-0.5"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-32 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Logo Image URL
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Hero Cover Banner Image URL
              </label>
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://..."
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Storefront Operations */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-6">
          <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
            <Store className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-gray-900">2. Store Operations & Rules</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="sm:col-span-2 flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <span className="font-bold text-sm text-gray-900 block">
                  Online Ordering Active
                </span>
                <span className="text-gray-500">
                  When turned off, customers cannot submit new checkout orders.
                </span>
              </div>
              <input
                type="checkbox"
                checked={isStoreOpen}
                onChange={(e) => setIsStoreOpen(e.target.checked)}
                className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Store Announcement Notice Banner
              </label>
              <input
                type="text"
                value={noticeBanner}
                onChange={(e) => setNoticeBanner(e.target.value)}
                placeholder="e.g. Free delivery on orders over $45! Use code WELCOME10"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={taxRatePercent}
                onChange={(e) => setTaxRatePercent(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Estimated Prep Time (mins)
              </label>
              <input
                type="number"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Min Order Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Base Delivery Fee ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={deliveryFeeBase}
                onChange={(e) => setDeliveryFeeBase(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Free Delivery Threshold Spend ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={freeDeliveryThreshold}
                onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-primary-foreground py-3.5 px-8 rounded-2xl font-bold text-sm shadow-lg shadow-primary/25 hover:brightness-105 active:scale-98 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}