export type Role = 'SUPER_ADMIN' | 'RESTAURANT_ADMIN' | 'STAFF' | 'KITCHEN';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED';

export type OrderType = 'DELIVERY' | 'PICKUP' | 'DINE_IN';

export type PaymentMethod = 'CASH_ON_DELIVERY' | 'PAY_AT_RESTAURANT' | 'STRIPE' | 'PAYPAL' | 'EASYPAISA' | 'JAZZCASH';

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: Role;
  restaurantId?: string | null;
}

export interface SelectedModifier {
  modifierId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartItem {
  id: string; // unique item uuid in cart
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  selectedModifiers: SelectedModifier[];
  specialInstructions?: string;
  itemTotal: number;
}

export interface RestaurantBranding {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  currency: string;
  currencySymbol: string;
  taxRatePercent: number;
  primaryColor: string;
  secondaryColor: string;
  settings?: {
    minOrderAmount: number;
    estimatedPrepTimeMinutes: number;
    deliveryRadiusKm: number;
    deliveryFeeBase: number;
    freeDeliveryThreshold: number;
    acceptsCash: boolean;
    acceptsCard: boolean;
    autoAcceptOrders: boolean;
    soundNotificationEnabled: boolean;
    noticeBanner?: string | null;
    isStoreOpen: boolean;
  } | null;
  isOpenNow?: boolean;
}

export interface OrderEventPayload {
  type: 'ORDER_CREATED' | 'ORDER_UPDATED' | 'STATUS_CHANGED';
  restaurantId: string;
  order: any;
  timestamp: string;
}
