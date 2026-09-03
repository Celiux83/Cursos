import { Clock, IdGenerator, Logger, User, UserRepository, UserRole } from './types';

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isPremium(user: User): boolean {
  return user.role === 'premium';
}

export function canCheckout(user: User): boolean {
  return user.active && user.role !== 'guest';
}

export class UserService {
  constructor(
    private readonly repo: UserRepository,
    private readonly logger: Logger,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
  ) {}

  async register(email: string, name: string, role: UserRole = 'member'): Promise<User> {
    const normalized = normalizeEmail(email);

    if (!isValidEmail(normalized)) {
      this.logger.error('invalid email on register', { email });
      throw new Error('Invalid email');
    }

    const existing = await this.repo.findByEmail(normalized);
    if (existing) {
      this.logger.warn('duplicated registration attempt', { email: normalized });
      throw new Error('Email already registered');
    }

    const user: User = {
      id: this.ids.next(),
      email: normalized,
      name: name.trim(),
      role,
      active: true,
      createdAt: this.clock.now().toISOString(),
    };

    const saved = await this.repo.save(user);
    this.logger.info('user registered', { id: saved.id });
    return saved;
  }

  async getById(id: string): Promise<User> {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new Error(`User ${id} not found`);
    }
    return user;
  }

  async upgrade(id: string): Promise<User> {
    const user = await this.getById(id);
    if (user.role === 'premium') {
      this.logger.info('user already premium', { id });
      return user;
    }
    const upgraded: User = { ...user, role: 'premium' };
    const saved = await this.repo.save(upgraded);
    this.logger.info('user upgraded', { id });
    return saved;
  }

  async deactivate(id: string): Promise<User> {
    const user = await this.getById(id);
    const saved = await this.repo.save({ ...user, active: false });
    this.logger.warn('user deactivated', { id });
    return saved;
  }

  async remove(id: string): Promise<boolean> {
    const deleted = await this.repo.delete(id);
    if (!deleted) {
      this.logger.error('failed to delete user', { id });
    }
    return deleted;
  }
}
