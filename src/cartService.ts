import { Cart, CartItem, Clock, Coupon, Logger, Product } from './types';
import { applyCoupon, calculateShipping, calculateSubtotal, calculateTotal } from './pricing';

export const MAX_QUANTITY_PER_ITEM = 10;

export function createEmptyCart(id: string, userId: string): Cart {
  return { id, userId, items: [] };
}

/**
 * Pure: returns a new cart, never mutates the input.
 */
export function addItem(cart: Cart, product: Product, quantity = 1): Cart {
  if (quantity <= 0) {
    throw new Error('Quantity must be greater than zero');
  }
  if (product.stock < quantity) {
    throw new Error(`Not enough stock for ${product.name}`);
  }

  const existing = cart.items.find((item) => item.productId === product.id);
  const newQuantity = (existing?.quantity ?? 0) + quantity;

  if (newQuantity > MAX_QUANTITY_PER_ITEM) {
    throw new Error(`Cannot add more than ${MAX_QUANTITY_PER_ITEM} units of ${product.name}`);
  }

  const items: CartItem[] = existing
    ? cart.items.map((item) => (item.productId === product.id ? { ...item, quantity: newQuantity } : item))
    : [
        ...cart.items,
        {
          productId: product.id,
          name: product.name,
          unitPrice: product.price,
          quantity,
        },
      ];

  return { ...cart, items };
}

export function removeItem(cart: Cart, productId: string): Cart {
  return { ...cart, items: cart.items.filter((item) => item.productId !== productId) };
}

export function updateQuantity(cart: Cart, productId: string, quantity: number): Cart {
  if (quantity < 0) {
    throw new Error('Quantity cannot be negative');
  }
  if (quantity === 0) {
    return removeItem(cart, productId);
  }
  const exists = cart.items.some((item) => item.productId === productId);
  if (!exists) {
    throw new Error(`Product ${productId} is not in the cart`);
  }
  return {
    ...cart,
    items: cart.items.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
  };
}

export function countItems(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function isEmpty(cart: Cart): boolean {
  return countItems(cart) === 0;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

export function summarize(cart: Cart, options: { coupon?: Coupon; isPremium?: boolean; now: Date }): CartSummary {
  const subtotal = calculateSubtotal(cart);
  const discount = options.coupon ? applyCoupon(subtotal, options.coupon, options.now) : 0;
  const shipping = calculateShipping(subtotal, options.isPremium);
  return { subtotal, discount, shipping, total: calculateTotal(subtotal, discount, shipping) };
}

/**
 * Side effects on purpose: logs and reads the clock through injected collaborators.
 */
export class CartTracker {
  private readonly events: string[] = [];

  constructor(
    private readonly logger: Logger,
    private readonly clock: Clock,
  ) {}

  track(cart: Cart, action: 'add' | 'remove' | 'clear'): Cart {
    const stamp = this.clock.now().toISOString();
    this.events.push(`${stamp}:${action}`);
    this.logger.info(`cart ${cart.id} -> ${action}`, { items: countItems(cart), at: stamp });
    if (action === 'clear') {
      this.logger.warn(`cart ${cart.id} was emptied`);
      return { ...cart, items: [] };
    }
    return cart;
  }

  history(): string[] {
    return [...this.events];
  }
}
