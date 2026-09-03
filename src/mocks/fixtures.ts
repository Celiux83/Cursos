import { Clock, Coupon, IdGenerator, Logger, Product, ProductRepository, User, UserRepository } from '../types';

export const products: Record<string, Product> = {
  book: { id: 'p-book', name: 'Clean Code', price: 25, stock: 10, category: 'books' },
  mouse: { id: 'p-mouse', name: 'Wireless Mouse', price: 19.99, stock: 5, category: 'electronics' },
  laptop: { id: 'p-laptop', name: 'Laptop 14"', price: 899.9, stock: 2, category: 'electronics' },
  coffee: { id: 'p-coffee', name: 'Coffee 1kg', price: 12.5, stock: 0, category: 'food' },
};

export const users: Record<string, User> = {
  member: {
    id: 'u-1',
    email: 'ana@example.com',
    name: 'Ana',
    role: 'member',
    active: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  premium: {
    id: 'u-2',
    email: 'bruno@example.com',
    name: 'Bruno',
    role: 'premium',
    active: true,
    createdAt: '2024-02-01T00:00:00.000Z',
  },
  guest: {
    id: 'u-3',
    email: 'guest@example.com',
    name: 'Guest',
    role: 'guest',
    active: true,
    createdAt: '2024-03-01T00:00:00.000Z',
  },
  inactive: {
    id: 'u-4',
    email: 'carla@example.com',
    name: 'Carla',
    role: 'member',
    active: false,
    createdAt: '2024-04-01T00:00:00.000Z',
  },
};

export const coupons: Record<string, Coupon> = {
  valid: { code: 'SAVE10', percentOff: 10, minTotal: 20, expiresAt: '2099-12-31T00:00:00.000Z' },
  expired: { code: 'OLD20', percentOff: 20, minTotal: 0, expiresAt: '2020-01-01T00:00:00.000Z' },
  highMin: { code: 'BIG50', percentOff: 50, minTotal: 1000, expiresAt: '2099-12-31T00:00:00.000Z' },
};

export function createFakeLogger(): Logger & { entries: string[] } {
  const entries: string[] = [];
  return {
    entries,
    info: (message) => void entries.push(`info:${message}`),
    warn: (message) => void entries.push(`warn:${message}`),
    error: (message) => void entries.push(`error:${message}`),
  };
}

export function createFixedClock(iso = '2025-01-01T12:00:00.000Z'): Clock {
  return { now: () => new Date(iso) };
}

export function createSequentialIds(prefix = 'id'): IdGenerator {
  let counter = 0;
  return { next: () => `${prefix}-${++counter}` };
}

export class InMemoryUserRepository implements UserRepository {
  private readonly store = new Map<string, User>();

  constructor(seed: User[] = []) {
    seed.forEach((user) => this.store.set(user.id, { ...user }));
  }

  async findById(id: string): Promise<User | null> {
    return this.store.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.store.values()) {
      if (user.email === email) return { ...user };
    }
    return null;
  }

  async save(user: User): Promise<User> {
    this.store.set(user.id, { ...user });
    return { ...user };
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}

export class InMemoryProductRepository implements ProductRepository {
  private readonly store = new Map<string, Product>();

  constructor(seed: Product[] = Object.values(products)) {
    seed.forEach((product) => this.store.set(product.id, { ...product }));
  }

  async findById(id: string): Promise<Product | null> {
    const product = this.store.get(id);
    return product ? { ...product } : null;
  }

  async decreaseStock(id: string, quantity: number): Promise<void> {
    const product = this.store.get(id);
    if (!product) throw new Error(`Product ${id} not found`);
    if (product.stock < quantity) throw new Error(`Not enough stock for ${product.name}`);
    this.store.set(id, { ...product, stock: product.stock - quantity });
  }
}
