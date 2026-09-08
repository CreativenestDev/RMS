export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  errorMessage?: string;
}

export interface PaymentProvider {
  id: string;
  name: string;
  description: string;
  isAvailable(restaurantSettings: any): boolean;
  processPayment(params: {
    orderNumber: string;
    amount: number;
    currency: string;
    customerEmail: string;
    metadata?: Record<string, any>;
  }): Promise<PaymentResult>;
}

export class CashOnDeliveryProvider implements PaymentProvider {
  id = 'CASH_ON_DELIVERY';
  name = 'Cash on Delivery (COD)';
  description = 'Pay cash to the rider upon doorstep delivery.';

  isAvailable(settings: any): boolean {
    return settings?.acceptsCash ?? true;
  }

  async processPayment(): Promise<PaymentResult> {
    return {
      success: true,
      transactionId: `COD-${Date.now()}`,
      paymentStatus: 'PENDING',
    };
  }
}

export class PayAtRestaurantProvider implements PaymentProvider {
  id = 'PAY_AT_RESTAURANT';
  name = 'Pay at Restaurant Counter';
  description = 'Pay cash or card when picking up your takeaway.';

  isAvailable(): boolean {
    return true;
  }

  async processPayment(): Promise<PaymentResult> {
    return {
      success: true,
      transactionId: `PAR-${Date.now()}`,
      paymentStatus: 'PENDING',
    };
  }
}

export class EasypaisaProvider implements PaymentProvider {
  id = 'EASYPAISA';
  name = 'Easypaisa Mobile Wallet';
  description = 'Pay via Easypaisa Wallet or QR (0300-1234567).';

  isAvailable(): boolean {
    return true;
  }

  async processPayment(): Promise<PaymentResult> {
    return {
      success: true,
      transactionId: `EP-${Date.now()}`,
      paymentStatus: 'PENDING',
    };
  }
}

export class JazzCashProvider implements PaymentProvider {
  id = 'JAZZCASH';
  name = 'JazzCash Mobile Account';
  description = 'Pay via JazzCash Wallet or Voucher code.';

  isAvailable(): boolean {
    return true;
  }

  async processPayment(): Promise<PaymentResult> {
    return {
      success: true,
      transactionId: `JC-${Date.now()}`,
      paymentStatus: 'PENDING',
    };
  }
}

export class RaastProvider implements PaymentProvider {
  id = 'RAAST';
  name = 'Raast Instant Bank Transfer';
  description = 'Zero-fee instant transfer via Raast ID / IBAN.';

  isAvailable(): boolean {
    return true;
  }

  async processPayment(): Promise<PaymentResult> {
    return {
      success: true,
      transactionId: `RAAST-${Date.now()}`,
      paymentStatus: 'PENDING',
    };
  }
}

const registry: Record<string, PaymentProvider> = {
  CASH_ON_DELIVERY: new CashOnDeliveryProvider(),
  PAY_AT_RESTAURANT: new PayAtRestaurantProvider(),
  EASYPAISA: new EasypaisaProvider(),
  JAZZCASH: new JazzCashProvider(),
  RAAST: new RaastProvider(),
};

export function getPaymentProvider(method: string): PaymentProvider {
  const provider = registry[method];
  if (!provider) {
    return registry.CASH_ON_DELIVERY;
  }
  return provider;
}

export function getAllSupportedPaymentMethods() {
  return Object.values(registry).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
  }));
}