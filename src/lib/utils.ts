import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | undefined | null, symbol: string = 'Rs. '): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${symbol.trim()} 0`;
  }
  const cleanSymbol = symbol.trim().endsWith('.')
    ? `${symbol.trim()} `
    : symbol.endsWith(' ')
    ? symbol
    : `${symbol} `;
  return `${cleanSymbol}${Math.round(amount).toLocaleString('en-US')}`;
}

export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '';
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

export function formatTime(date: string | Date | undefined | null): string {
  if (!date) return '';
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

export function isStoreCurrentlyOpen(
  businessHours: Array<{ dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }>,
  storeOpenSetting: boolean = true
): { isOpen: boolean; message: string } {
  if (!storeOpenSetting) {
    return { isOpen: false, message: 'Store is temporarily closed for orders' };
  }

  if (!businessHours || businessHours.length === 0) {
    return { isOpen: true, message: 'Open for orders' };
  }

  const now = new Date();
  const currentDay = now.getDay();
  const todayHour = businessHours.find((h) => h.dayOfWeek === currentDay);

  if (!todayHour || todayHour.isClosed) {
    return { isOpen: false, message: 'Closed today' };
  }

  const [openHour, openMinute] = todayHour.openTime.split(':').map(Number);
  const [closeHour, closeMinute] = todayHour.closeTime.split(':').map(Number);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openHour * 60 + openMinute;
  let closeMinutes = closeHour * 60 + closeMinute;

  // Handle midnight closing (e.g. 00:00 -> 24:00)
  if (closeMinutes === 0) {
    closeMinutes = 24 * 60;
  }

  if (currentMinutes >= openMinutes && currentMinutes <= closeMinutes) {
    return { isOpen: true, message: `Open until ${todayHour.closeTime}` };
  }

  return { isOpen: false, message: `Opens at ${todayHour.openTime}` };
}