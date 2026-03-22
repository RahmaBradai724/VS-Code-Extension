import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * Represents a user of the Configuration Management System.
 */
@Entity('users')
export class User {
  @PrimaryColumn()
  id: string; // Stored as string in the model for consistency with Extension APIs

  @Column()
  name: string;

  @Column()
  email: string;

  constructor(id: string, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  toJSON(): object {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
    };
  }

  static fromJSON(data: any): User {
    return new User(data.id || data.userId, data.name, data.email);
  }
}
