import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * Represents a user of the Configuration Management System.
 */
@Entity('users')
export class User {
  @PrimaryColumn()
  userId: string; // Stored as string in the model for consistency with Extension APIs

  @Column()
  name: string;

  @Column()
  email: string;

  constructor(userId: string, name: string, email: string) {
    this.userId = userId;
    this.name = name;
    this.email = email;
  }

  getUserId(): string { return this.userId; }
  getName(): string { return this.name; }
  getEmail(): string { return this.email; }

  createConfiguration(id: string, name: string): void {
    // Implementation would go here
  }

  manageConfiguration(config: any): void {
    // Implementation would go here
  }

  toJSON(): object {
    return {
      userId: this.userId,
      name: this.name,
      email: this.email,
    };
  }

  static fromJSON(data: any): User {
    return new User(data.userId || data.id, data.name, data.email);
  }
}
