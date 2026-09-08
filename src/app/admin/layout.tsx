'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  FolderTree,
  Sliders,
  Tag,
  Settings,
  BarChart3,
  ChefHat,
  Volume2,
  VolumeX,
  LogOut,
  Store,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { soundManager } from '@/lib/sound';

const NAVIGATION = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Live Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Products', href: '/admin/menu/products', icon: UtensilsCrossed },
  { name: 'Categories', href: '/admin/menu/categories', icon: FolderTree },
  { name: 'Modifiers', href: '/admin/menu/modifiers', icon: Sliders },
  { name: 'Coupons & Promos', href: '/admin/coupons', icon: Tag },
  { name: 'Settings & Branding', href: '/admin/settings', icon: Settings },
  { name: 'Sales & Reports', href: '/admin/reports', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // If on login page, render children directly without dashboard shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const [user, setUser] = useState<any>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {}
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {}
  };

  const testAudio = () => {
    soundManager.playNewOrderChime();
    setSoundEnabled(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link href="/admin" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-md shadow-primary/30">
              {user?.restaurant?.name ? user.restaurant.name.charAt(0) : 'R'}
            </div>
            <div>
              <span className="font-bold text-white text-sm block leading-tight">
                {user?.restaurant?.name || 'RMS Manager'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Operations Center</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAVIGATION.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-800 space-y-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Quick Surfaces
            </span>
            <Link
              href="/kitchen"
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-400 hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <ChefHat className="w-4 h-4" />
                <span>Kitchen Display (KDS)</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </Link>

            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <Store className="w-4 h-4" />
                <span>Customer Storefront</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </Link>
          </div>
        </nav>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-white block truncate">
                {user?.name || 'Staff User'}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                {user?.role || 'RESTAURANT_ADMIN'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main App Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Operational Bar */}
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center space-x-3">
            <h1 className="text-base font-bold text-gray-900 tracking-tight">
              {user?.restaurant?.name || 'Restaurant'} Management
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Audio Alert Toggle */}
            <button
              onClick={() => {
                if (!soundEnabled) testAudio();
                setSoundEnabled(!soundEnabled);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                soundEnabled
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-gray-100 border-gray-200 text-gray-500'
              }`}
              title="Click to test & toggle order alert chimes"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span>Chime Active</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>Muted</span>
                </>
              )}
            </button>

            {/* Storefront Link Button */}
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center space-x-1 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition-colors"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}