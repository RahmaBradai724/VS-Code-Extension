import { User } from '../../models/user';
import { getDataSource, initializeDatabase } from './DataSourceProvider';

/**
 * UserRepository encapsulates all User-related database operations.
 * Repository pattern: isolates data access from business logic.
 * SRP: User persistence only.
 */
export class UserRepository {
  async save(name: string, email: string): Promise<User> {
    await initializeDatabase();
    const repo = getDataSource().getRepository(User);

    let user = await repo.findOneBy({ name, email });
    if (user) { return user; }

    user = new User(name, email);
    return repo.save(user);
  }

  async findById(id: number): Promise<User | null> {
    await initializeDatabase();
    return getDataSource().getRepository(User).findOneBy({ id });
  }

  async findByNameAndEmail(name: string, email: string): Promise<User | null> {
    await initializeDatabase();
    return getDataSource().getRepository(User).findOneBy({ name, email });
  }
}
