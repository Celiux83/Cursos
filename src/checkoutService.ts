import { Cart, Clock, Coupon, IdGenerator, Logger, Order, ProductRepository, User } from './types';
import { isEmpty, summarize } from './cartService';
import { canCheckout, isPremium } from './userService';

export class CheckoutService {
  constructor(
    private readonly products: ProductRepository,
    private readonly logger: Logger,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
  ) {}

  async placeOrder(user: User, cart: Cart, coupon?: Coupon): Promise<Order> {
    if (!canCheckout(user)) {
      this.logger.error('checkout blocked', { userId: user.id, role: user.role });
      throw new Error('User is not allowed to checkout');
    }
    if (isEmpty(cart)) {
      throw new Error('Cart is empty');
    }

    const now = this.clock.now();

    for (const item of cart.items) {
      const product = await this.products.findById(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} no longer exists`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Not enough stock for ${product.name}`);
      }
    }

    for (const item of cart.items) {
      await this.products.decreaseStock(item.productId, item.quantity);
    }

    const summary = summarize(cart, { coupon, isPremium: isPremium(user), now });
    const order: Order = {
      id: this.ids.next(),
      userId: user.id,
      items: cart.items.map((item) => ({ ...item })),
      subtotal: summary.subtotal,
      discount: summary.discount,
      shipping: summary.shipping,
      total: summary.total,
      placedAt: now.toISOString(),
    };

    this.logger.info('order placed', { orderId: order.id, total: order.total });
    return order;
  }
}

/**
 * Side effects on purpose: uses global fetch, Date and Math.random directly,
 * so tests must spy on / stub globals.
 */
export async function submitOrderToGateway(
  order: Order,
  endpoint = 'https://payments.example.com/charge',
): Promise<{ ok: boolean; reference: string; attempts: number }> {
  const reference = `REF-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId: order.id, amount: order.total, reference }),
  });

  if (!response.ok) {
    console.error(`Payment failed for order ${order.id} with status ${response.status}`);
    return { ok: false, reference, attempts: 1 };
  }

  console.log(`Payment accepted for order ${order.id}`);
  return { ok: true, reference, attempts: 1 };
}
