'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/storefront/Navbar';
import { Footer } from '@/components/storefront/Footer';
import { ProductCard } from '@/components/storefront/ProductCard';
import { CartDrawer } from '@/components/storefront/CartDrawer';
import { RestaurantBranding } from '@/types';

export default function MenuPage() {
  const [restaurant, setRestaurant] = useState<RestaurantBranding | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    async function loadData() {
      try {
        const [configRes, menuRes] = await Promise.all([
          fetch('/api/storefront/config'),
          fetch('/api/storefront/menu'),
        ]);

        const configData = await configRes.json();
        const menuData = await menuRes.json();

        setRestaurant(configData.restaurant);
        setCategories(menuData.categories || []);
      } catch (e) {
        console.error('Failed to load menu data', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-3 text-primary">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-semibold text-gray-600">Loading delicious menu...</p>
        </div>
      </div>
    );
  }

  // Filter products based on category, search query, and dietary flags
  const allProducts = categories.flatMap((c) =>
    c.products.map((p: any) => ({ ...p, categoryName: c.name, categorySlug: c.slug }))
  );

  const filteredProducts = allProducts.filter((p) => {
    // Category match
    if (selectedCategory !== 'all' && p.categorySlug !== selectedCategory) {
      return false;
    }

    // Search match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }

    // Dietary filter
    if (activeFilter !== 'all') {
      try {
        const flags = JSON.parse(p.dietaryFlags || '[]');
        if (!flags.includes(activeFilter)) return false;
      } catch {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <Navbar restaurant={restaurant} />
      <CartDrawer restaurant={restaurant} />

      {/* Header bar */}
      <div className="bg-white border-b border-gray-100 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 mb-2">
            <Link href="/" className="hover:text-primary flex items-center space-x-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <span>/</span>
            <span className="text-gray-900">Menu</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                Our Full Menu
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Explore all {allProducts.length} items freshly prepared to order.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search burgers, pizzas, wings..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Dietary Filters & Categories Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-6 border-t border-gray-100 mt-6">
            {/* Category pills */}
            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Items
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.slug)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                    selectedCategory === c.slug
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Dietary Tags Filter */}
            <div className="flex items-center space-x-1.5 shrink-0 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 mr-1" />
              {['all', 'halal', 'spicy', 'veg', 'vegan', 'gluten_free'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveFilter(tag)}
                  className={`px-2.5 py-1 rounded-lg font-semibold uppercase tracking-wider text-[10px] transition-colors ${
                    activeFilter === tag
                      ? 'bg-slate-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tag === 'gluten_free' ? 'Gluten Free' : tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Results */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No items match your criteria</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">
              Try adjusting your search terms or clearing your dietary filters to see more results.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setActiveFilter('all');
              }}
              className="mt-5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold shadow hover:brightness-105 transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                restaurant={restaurant}
              />
            ))}
          </div>
        )}
      </main>

      <Footer restaurant={restaurant} />
    </div>
  );
}