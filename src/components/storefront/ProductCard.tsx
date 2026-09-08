'use client';

import React, { useState } from 'react';
import { Clock, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ModifierModal } from '@/components/storefront/ModifierModal';
import { RestaurantBranding } from '@/types';

interface ProductCardProps {
  product: any;
  restaurant: RestaurantBranding;
}

export function ProductCard({ product, restaurant }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const symbol = restaurant.currencySymbol || '$';

  let dietaryList: string[] = [];
  try {
    dietaryList = JSON.parse(product.dietaryFlags || '[]');
  } catch {}

  const hasModifiers =
    product.modifierGroupLinks && product.modifierGroupLinks.length > 0;

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="group bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 flex flex-col justify-between cursor-pointer"
      >
        <div>
          {/* Image Container */}
          <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-gray-100 mb-4">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl font-black bg-gray-50">
                {product.name.charAt(0)}
              </div>
            )}

            {/* Dietary badges */}
            <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
              {dietaryList.map((tag) => (
                <span
                  key={tag}
                  className="bg-black/60 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Preparation time badge */}
            {product.preparationTimeMinutes && (
              <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur text-gray-700 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center space-x-1 shadow-sm">
                <Clock className="w-3 h-3 text-primary" />
                <span>{product.preparationTimeMinutes}m</span>
              </div>
            )}
          </div>

          {/* Title & Description */}
          <div className="space-y-1.5 mb-3">
            <h3 className="font-bold text-base text-gray-900 leading-snug group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-gray-50 flex items-center justify-between mt-auto">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-base font-black text-gray-900">
              {formatCurrency(product.basePrice, symbol)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatCurrency(product.compareAtPrice, symbol)}
              </span>
            )}
          </div>

          <button
            type="button"
            className="flex items-center space-x-1 bg-gray-100 hover:bg-primary text-gray-800 hover:text-white px-3 py-1.5 rounded-xl font-bold text-xs transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{hasModifiers ? 'Customize' : 'Add'}</span>
          </button>
        </div>
      </div>

      {/* Customization Modal */}
      <ModifierModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        restaurant={restaurant}
      />
    </>
  );
}