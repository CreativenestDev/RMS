'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Globe,
  Plus,
  Store,
  Users,
  ShoppingBag,
  ExternalLink,
  Loader2,
  X,
  AlertCircle,
  LogOut,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function SuperAdminPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Tenant Form
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const loadRestaurants = async () => {
    try {
      const res = await fetch('/api/super-admin/restaurants');
      const data = await res.json();
      if (data.restaurants) setRestaurants(data.restaurants);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/super-admin/login');
  };

  const toggleTenantStatus = async (restaurantId: string, current: boolean) => {
    try {
      await fetch('/api/super-admin/restaurants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId, isActive: !current }),
      });
      setRestaurants((prev) =>
        prev.map((r) => (r.id === restaurantId ? { ...r, isActive: !current } : r))
      );
    } catch (e) {}
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !adminEmail || !adminPassword) return;

    setCreating(true);
    setError('');

    try {
      const res = await fetch('/api/super-admin/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          adminName,
          adminEmail,
          adminPassword,
          primaryColor,
          currencySymbol,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create restaurant tenant');

      await loadRestaurants();
      setIsModalOpen(false);
      setName('');
      setSlug('');
      setAdminEmail('');
      setAdminPassword('');
    } catch (err: any) {
      setError(err.message || 'Error creating tenant');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const totalOrders = restaurants.reduce((sum, r) => sum + (r._count?.orders || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white leading-tight">
              RMS PLATFORM SUPER-ADMIN
            </h1>
            <span className="text-xs text-indigo-400 font-semibold">
              White-Label Multi-Tenant Control Hub
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Provision New Restaurant Tenant</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase">
                Active Restaurants
              </span>
              <span className="text-2xl font-black text-white block leading-tight">
                {restaurants.length} Tenants
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase">
                Total Platform Orders
              </span>
              <span className="text-2xl font-black text-white block leading-tight">
                {totalOrders}
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase">System Health</span>
              <span className="text-2xl font-black text-emerald-400 block leading-tight">
                100% Operational
              </span>
            </div>
          </div>
        </div>

        {/* Tenants Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Registered Restaurant Tenants</h2>
            <span className="text-xs text-slate-400">
              Isolated database scoping per restaurant_id
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 uppercase tracking-wider text-[10px] font-bold text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Restaurant</th>
                  <th className="px-6 py-4">Tenant Slug</th>
                  <th className="px-6 py-4">Admin Email</th>
                  <th className="px-6 py-4">Products</th>
                  <th className="px-6 py-4">Orders</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {restaurants.map((restaurant) => {
                  const adminUser = restaurant.users.find(
                    (u: any) => u.role === 'RESTAURANT_ADMIN'
                  ) || restaurant.users[0];

                  return (
                    <tr key={restaurant.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: restaurant.primaryColor }}
                          />
                          <span className="font-bold text-white text-sm">
                            {restaurant.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-indigo-400 font-semibold">
                        /{restaurant.slug}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {adminUser?.email || 'None'}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-200">
                        {restaurant._count?.products || 0} items
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-200">
                        {restaurant._count?.orders || 0} orders
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleTenantStatus(restaurant.id, restaurant.isActive)}
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-colors ${
                            restaurant.isActive
                              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                          }`}
                        >
                          {restaurant.isActive ? 'Active' : 'Suspended'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/?restaurant=${restaurant.slug}`}
                          target="_blank"
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1"
                        >
                          <span>Storefront</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Provision Tenant Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-black text-white">Provision New Restaurant Tenant</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateTenant} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!slug) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                      }
                    }}
                    placeholder="e.g. Bella Italia"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. bella-italia"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">
                  Manager Email *
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="manager@bellaitalia.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">
                    Initial Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-9 h-9 rounded-xl border border-slate-700 p-0.5 bg-slate-950 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center space-x-1"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Provision Tenant</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}