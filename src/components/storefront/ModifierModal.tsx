'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Check, AlertCircle } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { formatCurrency } from '@/lib/utils';
import { RestaurantBranding } from '@/types';

interface ModifierModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  restaurant: RestaurantBranding;
}

export function ModifierModal({
  product,
  isOpen,
  onClose,
  restaurant,
}: ModifierModalProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [selectedModifiers, setSelectedModifiers] = useState<
    Record<string, { modifierId: string; name: string; price: number; quantity: number }[]>
  >({});

  const symbol = restaurant.currencySymbol || '$';

  // Initialize defaults on product open
  useEffect(() => {
    if (!product) return;
    setQuantity(1);
    setSpecialInstructions('');

    const initialSelections: Record<string, any[]> = {};

    (product.modifierGroupLinks || []).forEach((link: any) => {
      const group = link.modifierGroup;
      if (!group) return;

      const defaults = group.modifiers.filter((m: any) => m.isDefault);
      if (defaults.length > 0) {
        initialSelections[group.id] = defaults.map((d: any) => ({
          modifierId: d.id,
          name: d.name,
          price: d.price,
          quantity: 1,
        }));
      } else if (group.isRequired && group.modifiers.length > 0) {
        // Automatically pick the first one for single required groups
        const first = group.modifiers[0];
        initialSelections[group.id] = [
          {
            modifierId: first.id,
            name: first.name,
            price: first.price,
            quantity: 1,
          },
        ];
      } else {
        initialSelections[group.id] = [];
      }
    });

    setSelectedModifiers(initialSelections);
  }, [product]);

  if (!isOpen || !product) return null;

  // Calculate dynamic item price
  const basePrice = product.basePrice || 0;
  const modifiersPrice = Object.values(selectedModifiers)
    .flat()
    .reduce((acc, m) => acc + m.price * (m.quantity || 1), 0);
  const unitPrice = basePrice + modifiersPrice;
  const totalPrice = unitPrice * quantity;

  // Validation: Check if all required groups are satisfied
  let isValid = true;
  let validationMessage = '';

  for (const link of product.modifierGroupLinks || []) {
    const group = link.modifierGroup;
    if (!group) continue;
    const current = selectedModifiers[group.id] || [];

    if (group.isRequired && current.length < (group.minSelections || 1)) {
      isValid = false;
      validationMessage = `Please select an option for "${group.name}"`;
      break;
    }
  }

  const handleSingleSelect = (groupId: string, modifier: any) => {
    setSelectedModifiers((prev) => ({
      ...prev,
      [groupId]: [
        {
          modifierId: modifier.id,
          name: modifier.name,
          price: modifier.price,
          quantity: 1,
        },
      ],
    }));
  };

  const handleMultiSelect = (groupId: string, modifier: any, maxSelections: number) => {
    setSelectedModifiers((prev) => {
      const current = prev[groupId] || [];
      const exists = current.some((m) => m.modifierId === modifier.id);

      if (exists) {
        return {
          ...prev,
          [groupId]: current.filter((m) => m.modifierId !== modifier.id),
        };
      }

      if (current.length >= maxSelections && maxSelections > 0) {
        return prev; // Max selection limit reached
      }

      return {
        ...prev,
        [groupId]: [
          ...current,
          {
            modifierId: modifier.id,
            name: modifier.name,
            price: modifier.price,
            quantity: 1,
          },
        ],
      };
    });
  };

  const handleAddToCart = () => {
    if (!isValid) return;

    const flatModifiers = Object.values(selectedModifiers).flat();

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.basePrice,
      quantity,
      imageUrl: product.imageUrl,
      selectedModifiers: flatModifiers,
      specialInstructions: specialInstructions.trim() || undefined,
    });

    onClose();
  };

  let dietaryList: string[] = [];
  try {
    dietaryList = JSON.parse(product.dietaryFlags || '[]');
  } catch {}

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow-md backdrop-blur transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Product Header Imagery */}
          {product.imageUrl && (
            <div className="relative h-56 sm:h-64 w-full shrink-0 overflow-hidden bg-gray-100">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {dietaryList.map((tag) => (
                    <span
                      key={tag}
                      className="bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {product.calories && (
                    <span className="bg-black/50 backdrop-blur text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                      {product.calories} kcal
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-black leading-tight drop-shadow-sm">
                  {product.name}
                </h3>
              </div>
            </div>
          )}

          {/* Content Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {!product.imageUrl && (
              <div>
                <h3 className="text-2xl font-black text-gray-900 leading-tight">
                  {product.name}
                </h3>
              </div>
            )}

            {product.description && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Modifier Groups */}
            {(product.modifierGroupLinks || []).map((link: any) => {
              const group = link.modifierGroup;
              if (!group || !group.modifiers || group.modifiers.length === 0) return null;

              const isSingleChoice = group.maxSelections === 1;
              const currentSelections = selectedModifiers[group.id] || [];

              return (
                <div key={group.id} className="border-t border-gray-100 pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{group.name}</h4>
                      {group.description && (
                        <p className="text-xs text-gray-400">{group.description}</p>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        group.isRequired
                          ? currentSelections.length >= (group.minSelections || 1)
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {group.isRequired
                        ? currentSelections.length >= (group.minSelections || 1)
                          ? 'Satisfied'
                          : 'Required'
                        : `Optional (up to ${group.maxSelections})`}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {group.modifiers.map((modifier: any) => {
                      const isSelected = currentSelections.some(
                        (m) => m.modifierId === modifier.id
                      );

                      return (
                        <div
                          key={modifier.id}
                          onClick={() => {
                            if (isSingleChoice) {
                              handleSingleSelect(group.id, modifier);
                            } else {
                              handleMultiSelect(group.id, modifier, group.maxSelections);
                            }
                          }}
                          className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all select-none ${
                            isSelected
                              ? 'border-primary bg-primary/5 text-gray-900 font-medium'
                              : 'border-gray-100 hover:border-gray-200 bg-white text-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-5 h-5 rounded-${
                                isSingleChoice ? 'full' : 'md'
                              } border flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'bg-primary border-primary text-white'
                                  : 'border-gray-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <span className="text-sm">{modifier.name}</span>
                          </div>

                          {modifier.price > 0 ? (
                            <span className="text-xs font-semibold text-primary">
                              +{formatCurrency(modifier.price, symbol)}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Free</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Special Instructions */}
            <div className="border-t border-gray-100 pt-5">
              <label className="block text-sm font-bold text-gray-900 mb-1">
                Special Instructions
              </label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. dressing on the side, extra napkins, allergy notes..."
                rows={2}
                className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Sticky Modal Footer */}
          <div className="p-5 border-t border-gray-100 bg-gray-50/80 shrink-0 space-y-3">
            {!isValid && (
              <div className="flex items-center space-x-1.5 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              {/* Quantity Stepper */}
              <div className="flex items-center space-x-3 bg-white border border-gray-200 rounded-2xl p-1.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-gray-900 px-1">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add To Cart Button */}
              <button
                type="button"
                disabled={!isValid}
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 px-5 rounded-2xl font-bold text-sm shadow-md flex items-center justify-between transition-all ${
                  isValid
                    ? 'bg-primary text-primary-foreground shadow-primary/25 hover:brightness-105 active:scale-95'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Add to Cart</span>
                <span>{formatCurrency(totalPrice, symbol)}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}