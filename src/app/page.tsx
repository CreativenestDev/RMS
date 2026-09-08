import React from 'react';
import Link from 'next/link';
import { Clock, Bike, DollarSign, Sparkles, ChevronRight, Star, ArrowRight } from 'lucide-react';
import { db } from '@/lib/db';
import { getDefaultRestaurant } from '@/lib/tenant';
import { Navbar } from '@/components/storefront/Navbar';
import { Footer } from '@/components/storefront/Footer';
import { ProductCard } from '@/components/storefront/ProductCard';
import { CartDrawer } from '@/components/storefront/CartDrawer';
import { formatCurrency } from '@/lib/utils';
import { DEMO_CATEGORIES } from '@/lib/demo-data';

async function getCategories(restaurantId: string) {
  return await db.category.findMany({
    where: {
      restaurantId,
      isActive: true,
    },
    orderBy: { sortOrder: 'asc' },
    include: {
      products: {
        where: { isAvailable: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          modifierGroupLinks: {
            orderBy: { sortOrder: 'asc' },
            include: {
              modifierGroup: {
                include: {
                  modifiers: {
                    where: { isAvailable: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

type CategoryWithProducts = Awaited<ReturnType<typeof getCategories>>;

export const dynamic = 'force-dynamic';

export default async function StorefrontHomePage() {
  const restaurant = await getDefaultRestaurant();

  let categories: CategoryWithProducts = [];
  try {
    categories = await getCategories(restaurant.id);
  } catch (err) {
    console.warn('Could not query categories during page render:', err);
  }

  if (!categories || categories.length === 0) {
    categories = DEMO_CATEGORIES as any;
  }

  const featuredProducts = categories
    .flatMap((c) => c.products)
    .filter((p) => p.isFeatured)
    .slice(0, 4);

  const symbol = restaurant.currencySymbol || '$';

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <Navbar restaurant={restaurant} />
      <CartDrawer restaurant={restaurant} />

      {/* Hero Section */}
      <section className="relative bg-slate-950 text-white overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        {restaurant.coverUrl && (
          <div className="absolute inset-0 opacity-30 mix-blend-luminosity">
            <img
              src={restaurant.coverUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover scale-105"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col justify-center">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center space-x-2 bg-primary/20 border border-primary/30 text-primary-foreground px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Gourmet Street Food & Artisanal Craft</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Crave-worthy bites, <br />
              <span className="text-primary">crafted fresh daily.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              From smashed Angus patties and hot-honey sourdough pizzas to crispy hand-breaded chicken tenders. Order direct for fast doorstep delivery.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/menu"
                className="bg-primary text-primary-foreground px-7 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-primary/25 hover:brightness-110 active:scale-95 transition-all flex items-center space-x-2"
              >
                <span>View Full Menu</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#menu-section"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3.5 rounded-2xl font-bold text-sm backdrop-blur transition-all"
              >
                Explore Categories
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-lg">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="block text-xs text-slate-400">Prep & Delivery</span>
                  <span className="font-bold text-xs sm:text-sm text-white">
                    {restaurant.settings?.estimatedPrepTimeMinutes ?? 20} - {(restaurant.settings?.estimatedPrepTimeMinutes ?? 20) + 15}m
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                  <Bike className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="block text-xs text-slate-400">Delivery From</span>
                  <span className="font-bold text-xs sm:text-sm text-white">
                    {formatCurrency(restaurant.settings?.deliveryFeeBase ?? 3.5, symbol)}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="block text-xs text-slate-400">Min Order</span>
                  <span className="font-bold text-xs sm:text-sm text-white">
                    {formatCurrency(restaurant.settings?.minOrderAmount ?? 15, symbol)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Specialties */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center space-x-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                <Star className="w-3.5 h-3.5 fill-primary" />
                <span>Chef&apos;s Highlights</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Customer Favorites
              </h2>
            </div>
            <Link
              href="/menu"
              className="text-primary font-bold text-xs sm:text-sm hover:underline flex items-center space-x-1"
            >
              <span>See All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                restaurant={restaurant}
              />
            ))}
          </div>
        </section>
      )}

      {/* Category Navigation Pills */}
      <section id="menu-section" className="sticky top-16 z-30 bg-white/95 backdrop-blur border-y border-gray-100 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`#cat-${cat.slug}`}
                className="whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold text-gray-700 bg-gray-100 hover:bg-primary hover:text-white transition-all shadow-xs shrink-0"
              >
                {cat.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Full Menu Grouped by Category */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 flex-1">
        {categories.map((category) => (
          <section key={category.id} id={`cat-${category.slug}`} className="scroll-mt-36">
            <div className="mb-6">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center space-x-2">
                <span>{category.name}</span>
                <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full">
                  {category.products.length}
                </span>
              </h3>
              {category.description && (
                <p className="text-sm text-gray-500 mt-1">{category.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  restaurant={restaurant}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      <Footer restaurant={restaurant} />
    </div>
  );
}