'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, SelectedModifier } from '@/types';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (
    item: Omit<CartItem, 'id' | 'itemTotal'> & {
      selectedModifiers?: SelectedModifier[];
    }
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'rms_customer_cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart to storage', e);
      }
    }
  }, [items, isMounted]);

  const addToCart = (
    item: Omit<CartItem, 'id' | 'itemTotal'> & {
      selectedModifiers?: SelectedModifier[];
    }
  ) => {
    const modifiers = item.selectedModifiers || [];
    const modifiersTotal = modifiers.reduce((acc, m) => acc + m.price * (m.quantity || 1), 0);
    const unitPrice = item.price + modifiersTotal;
    const itemTotal = unitPrice * item.quantity;

    // Check if an identical item (same product and identical modifiers) exists
    const modifierSignature = JSON.stringify(
      modifiers
        .map((m) => `${m.modifierId}:${m.quantity}`)
        .sort()
    );

    setItems((prev) => {
      const existingIndex = prev.findIndex((p) => {
        if (p.productId !== item.productId) return false;
        const pSignature = JSON.stringify(
          (p.selectedModifiers || [])
            .map((m) => `${m.modifierId}:${m.quantity}`)
            .sort()
        );
        return pSignature === modifierSignature && p.specialInstructions === item.specialInstructions;
      });

      if (existingIndex > -1) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + item.quantity;
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          itemTotal: (existing.price + modifiersTotal) * newQty,
        };
        return updated;
      }

      const newItem: CartItem = {
        id: `${item.productId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
        selectedModifiers: modifiers,
        specialInstructions: item.specialInstructions,
        itemTotal,
      };

      return [...prev, newItem];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          const modTotal = (item.selectedModifiers || []).reduce(
            (acc, m) => acc + m.price * (m.quantity || 1),
            0
          );
          return {
            ...item,
            quantity,
            itemTotal: (item.price + modTotal) * quantity,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}
  };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.itemTotal, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}