import { User } from '../../models/user';
import { AuthService } from '../auth/AuthService';
import { getDataSource, initializeDatabase } from './DataSourceProvider';

/**
 * UserRepository encapsulates all User-related database operations.
 * Repository pattern: isolates data access from business logic.
 * SRP: User persistence only.
 */
export class UserRepository {
  constructor(private readonly authService: AuthService) {}

  async register(name: string, email: string, password: string): Promise<User> {
    await initializeDatabase();
    const repo = getDataSource().getRepository(User);

    const existing = await repo.findOneBy({ email });
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const user = new User(name, email);
    user.passwordHash = await this.authService.hashPassword(password);
    return repo.save(user);
  }

  async login(email: string, password: string): Promise<User> {
    await initializeDatabase();
    const repo = getDataSource().getRepository(User);

    const user = await repo.findOneBy({ email });
    if (!user) {
      throw new Error('No account found with that email.');
    }
    if (!user.passwordHash) {
      throw new Error('Account has no password set. Please contact the administrator.');
    }
    const valid = await this.authService.verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new Error('Incorrect password.');
    }
    return user;
  }

  async findById(id: number): Promise<User | null> {
    await initializeDatabase();
    return getDataSource().getRepository(User).findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    await initializeDatabase();
    return getDataSource().getRepository(User).findOneBy({ email });
  }

  /** @deprecated Use findByEmail + login instead */
  async save(name: string, email: string): Promise<User> {
    await initializeDatabase();
    const repo = getDataSource().getRepository(User);
    let user = await repo.findOneBy({ email });
    if (user) { return user; }
    user = new User(name, email);
    return repo.save(user);
  }
}

