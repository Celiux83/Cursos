import { Cart, CartItem, Coupon } from './types';

export const FREE_SHIPPING_THRESHOLD = 50;
export const FLAT_SHIPPING_COST = 4.99;

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function lineTotal(item: CartItem): number {
  if (item.quantity < 0) {
    throw new Error('Quantity cannot be negative');
  }
  return roundMoney(item.unitPrice * item.quantity);
}

export function calculateSubtotal(cart: Cart): number {
  return roundMoney(cart.items.reduce((sum, item) => sum + lineTotal(item), 0));
}

export function calculateShipping(subtotal: number, isPremium = false): number {
  if (isPremium) return 0;
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_COST;
}

export function isCouponValid(coupon: Coupon, subtotal: number, now: Date): boolean {
  if (coupon.percentOff <= 0 || coupon.percentOff > 100) return false;
  if (subtotal < coupon.minTotal) return false;
  return new Date(coupon.expiresAt).getTime() > now.getTime();
}

export function applyCoupon(subtotal: number, coupon: Coupon, now: Date): number {
  if (!isCouponValid(coupon, subtotal, now)) return 0;
  return roundMoney((subtotal * coupon.percentOff) / 100);
}

export function calculateTotal(subtotal: number, discount: number, shipping: number): number {
  const total = subtotal - discount + shipping;
  return roundMoney(Math.max(total, 0));
}
