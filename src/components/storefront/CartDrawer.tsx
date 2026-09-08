'use client';

import React from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { formatCurrency } from '@/lib/utils';
import { RestaurantBranding } from '@/types';

interface CartDrawerProps {
  restaurant: RestaurantBranding;
}

export function CartDrawer({ restaurant }: CartDrawerProps) {
  const {
    items,
    itemCount,
    subtotal,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  if (!isCartOpen) return null;

  const symbol = restaurant.currencySymbol || '$';
  const freeDeliveryThreshold = restaurant.settings?.freeDeliveryThreshold ?? 45;
  const amountToFreeDelivery = freeDeliveryThreshold - subtotal;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-gray-900">Your Order</h2>
              <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free delivery tracker */}
          {restaurant.settings?.freeDeliveryThreshold && (
            <div className="bg-orange-50/80 px-5 py-2.5 text-xs text-orange-900 border-b border-orange-100/60">
              {amountToFreeDelivery > 0 ? (
                <p>
                  Add <span className="font-bold">{formatCurrency(amountToFreeDelivery, symbol)}</span> more to qualify for <span className="font-semibold text-primary">Free Delivery</span>!
                </p>
              ) : (
                <p className="font-semibold text-emerald-700">
                  🎉 You have unlocked Free Delivery!
                </p>
              )}
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-base font-semibold text-gray-700 mb-1">Your cart is empty</p>
                <p className="text-xs text-gray-400 mb-6">Explore our menu and add your favorite dishes.</p>
                <Link
                  href="/menu"
                  onClick={() => setIsCartOpen(false)}
                  className="bg-primary text-primary-foreground text-sm font-medium px-5 py-2.5 rounded-xl shadow hover:brightness-105 transition-all"
                >
                  Browse Menu
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:border-gray-200 transition-all flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover shrink-0"
                        />
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 leading-tight">
                          {item.name}
                        </h4>
                        <span className="text-xs font-semibold text-primary">
                          {formatCurrency(item.price, symbol)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-300 hover:text-rose-500 p-1 rounded transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Modifiers breakdown */}
                  {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                    <div className="pl-2 border-l-2 border-primary/20 space-y-0.5 text-xs text-gray-500">
                      {item.selectedModifiers.map((mod, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>+ {mod.name}</span>
                          {mod.price > 0 && (
                            <span className="text-gray-700 font-medium">
                              +{formatCurrency(mod.price * (mod.quantity || 1), symbol)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Special instructions */}
                  {item.specialInstructions && (
                    <p className="text-xs text-gray-400 italic bg-gray-50 px-2 py-1 rounded">
                      &quot;{item.specialInstructions}&quot;
                    </p>
                  )}

                  {/* Quantity Stepper & Item Total */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-1">
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-white rounded transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold text-gray-900 px-1">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-white rounded transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(item.itemTotal, symbol)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-gray-50/70 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(subtotal, symbol)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Taxes & Delivery fee</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={clearCart}
                  className="px-3 py-3 border border-gray-200 text-gray-500 hover:text-rose-600 hover:border-rose-200 rounded-xl text-xs font-semibold transition-colors"
                >
                  Clear
                </button>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="flex-1 bg-primary text-primary-foreground py-3.5 px-4 rounded-xl font-bold text-sm shadow-md shadow-primary/20 flex items-center justify-center space-x-2 hover:brightness-105 active:scale-95 transition-all"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}