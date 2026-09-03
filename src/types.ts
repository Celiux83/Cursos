export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: 'books' | 'electronics' | 'food' | 'toys';
}

export interface CartItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  couponCode?: string;
}

export type UserRole = 'guest' | 'member' | 'premium';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export interface Coupon {
  code: string;
  percentOff: number;
  minTotal: number;
  expiresAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  placedAt: string;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<boolean>;
}

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  decreaseStock(id: string, quantity: number): Promise<void>;
}

export interface Logger {
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, meta?: unknown): void;
}

export interface Clock {
  now(): Date;
}

export interface IdGenerator {
  next(): string;
}
