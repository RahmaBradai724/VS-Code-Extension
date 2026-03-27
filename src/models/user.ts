import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

/**
 * Represents a user of the Configuration Management System.
 */
@Entity('users')
@Index(['name', 'email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name: string;

  @Column()
  email: string;

  constructor(name: string, email: string) {
    this.name = name;
    this.email = email;
  }

  /** String-based user ID for backward compatibility with StorageService / UI. */
  getUserId(): string {
    return String(this.id);
  }
  getName(): string {
    return this.name;
  }
  getEmail(): string {
    return this.email;
  }

  createConfiguration(id: string, name: string): void {
    // Implementation would go here
  }

  manageConfiguration(config: any): void {
    // Implementation would go here
  }

  toJSON(): object {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
    };
  }

  static fromJSON(data: any): User {
    const u = new User(data.name, data.email);
    if (data.id != null) {
      u.id = data.id;
    }
    return u;
  }
}