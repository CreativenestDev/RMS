import { EventEmitter } from 'events';
import { OrderEventPayload } from '@/types';

class OrderEventManager extends EventEmitter {}

const globalForEvents = globalThis as unknown as {
  orderEventManager: OrderEventManager | undefined;
};

export const eventBus = globalForEvents.orderEventManager ?? new OrderEventManager();
eventBus.setMaxListeners(200);

if (process.env.NODE_ENV !== 'production') {
  globalForEvents.orderEventManager = eventBus;
}

export function broadcastTenantOrderEvent(restaurantId: string, event: OrderEventPayload) {
  eventBus.emit(`tenant:${restaurantId}`, event);
  if (event.order && event.order.orderNumber) {
    eventBus.emit(`order:${event.order.orderNumber}`, event);
  }
}