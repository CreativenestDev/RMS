import { db } from '@/lib/db';
import { isStoreCurrentlyOpen } from '@/lib/utils';
import { RestaurantBranding } from '@/types';

export const DEFAULT_RESTAURANT_SLUG = 'urban-bites';

export async function getRestaurantBySlug(slug: string = DEFAULT_RESTAURANT_SLUG): Promise<RestaurantBranding | null> {
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
}

export async function getDefaultRestaurant(): Promise<RestaurantBranding> {
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

  if (!restaurant) {
    throw new Error('No active restaurant found in database. Please run npm run db:seed.');
  }

  return restaurant;
}