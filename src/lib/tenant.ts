import { db } from '@/lib/db';
import { isStoreCurrentlyOpen } from '@/lib/utils';
import { RestaurantBranding } from '@/types';

export const DEFAULT_RESTAURANT_SLUG = 'urban-bites';

export async function getRestaurantBySlug(slug: string = DEFAULT_RESTAURANT_SLUG): Promise<RestaurantBranding | null> {
  try {
    const restaurant = await db.restaurant.findUnique({
      where: { slug },
      include: {
        settings: true,
        hours: {
          orderBy: { dayOfWeek: 'asc' },
        },
        deliveryZones: {
          orderBy: { minDistanceKm: 'asc' },
        },
      },
    });

    if (!restaurant || !restaurant.isActive) {
      return null;
    }

    const { isOpen } = isStoreCurrentlyOpen(restaurant.hours, restaurant.settings?.isStoreOpen ?? true);

    return {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      logoUrl: restaurant.logoUrl,
      coverUrl: restaurant.coverUrl,
      phone: restaurant.phone,
      email: restaurant.email,
      address: restaurant.address,
      currency: restaurant.currency,
      currencySymbol: restaurant.currencySymbol,
      taxRatePercent: restaurant.taxRatePercent,
      primaryColor: restaurant.primaryColor,
      secondaryColor: restaurant.secondaryColor,
      settings: restaurant.settings,
      isOpenNow: isOpen,
    };
  } catch (err) {
    console.warn('getRestaurantBySlug error:', err);
    return null;
  }
}

export const FALLBACK_RESTAURANT: RestaurantBranding = {
  id: 'urban-bites',
  name: 'Urban Bites',
  slug: 'urban-bites',
  logoUrl: null,
  coverUrl: null,
  phone: '+92 300 1234567',
  email: 'contact@urbanbites.pk',
  address: 'Gulberg III, Lahore, Pakistan',
  currency: 'PKR',
  currencySymbol: 'Rs. ',
  taxRatePercent: 5.0,
  primaryColor: '#ea580c',
  secondaryColor: '#0f172a',
  settings: {
    minOrderAmount: 500,
    estimatedPrepTimeMinutes: 25,
    deliveryRadiusKm: 15,
    deliveryFeeBase: 180,
    freeDeliveryThreshold: 2000,
    acceptsCash: true,
    acceptsCard: true,
    autoAcceptOrders: true,
    soundNotificationEnabled: true,
    noticeBanner: null,
    isStoreOpen: true,
  },
  isOpenNow: true,
};

export async function getDefaultRestaurant(): Promise<RestaurantBranding> {
  try {
    let restaurant = await getRestaurantBySlug(DEFAULT_RESTAURANT_SLUG);
    if (!restaurant) {
      const first = await db.restaurant.findFirst({
        where: { isActive: true },
        include: { settings: true, hours: true, deliveryZones: true },
      });
      if (first) {
        restaurant = await getRestaurantBySlug(first.slug);
      }
    }
    if (restaurant) return restaurant;
  } catch (err) {
    console.warn('getDefaultRestaurant error:', err);
  }

  return FALLBACK_RESTAURANT;
}