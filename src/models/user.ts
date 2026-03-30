import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';


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
  }

  manageConfiguration(config: any): void {
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