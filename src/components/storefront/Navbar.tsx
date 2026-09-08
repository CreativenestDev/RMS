'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Phone, Clock, ShieldCheck } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { RestaurantBranding } from '@/types';

interface NavbarProps {
  restaurant: RestaurantBranding;
}

export function Navbar({ restaurant }: NavbarProps) {
  const { itemCount, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      {/* Top micro-bar for announcement or open status */}
      {restaurant.settings?.noticeBanner && (
        <div className="bg-primary text-primary-foreground text-xs text-center py-1.5 px-4 font-medium tracking-wide">
          {restaurant.settings.noticeBanner}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center space-x-3 group">
          {restaurant.logoUrl ? (
            <img
              src={restaurant.logoUrl}
              alt={restaurant.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary/20 shadow-sm group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center text-lg shadow-sm">
              {restaurant.name.charAt(0)}
            </div>
          )}
          <div>
            <span className="font-bold text-lg sm:text-xl text-gray-900 tracking-tight block leading-tight">
              {restaurant.name}
            </span>
            <div className="flex items-center space-x-1.5 text-xs text-gray-500">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  restaurant.isOpenNow ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span>{restaurant.isOpenNow ? 'Open Now' : 'Closed for Orders'}</span>
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-700">
          <Link href="/menu" className="hover:text-primary transition-colors">
            Full Menu
          </Link>
          <Link href="/#about" className="hover:text-primary transition-colors">
            Hours & Location
          </Link>
          <Link href="/admin/login" className="flex items-center space-x-1 text-gray-500 hover:text-gray-900">
            <ShieldCheck className="w-4 h-4" />
            <span>Staff Portal</span>
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-3">
          {restaurant.phone && (
            <a
              href={`tel:${restaurant.phone}`}
              className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-full transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-primary" />
              <span>{restaurant.phone}</span>
            </a>
          )}

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-full font-medium shadow-md shadow-primary/20 hover:brightness-105 active:scale-95 transition-all"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-sm font-semibold hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span className="bg-white text-primary text-xs font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center shadow-sm">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}