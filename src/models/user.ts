/**
 * Represents a user of the Configuration Management System.
 */
export class User {
  userId: string;
  name: string;
  email: string;

  constructor(userId: string, name: string, email: string) {
    this.userId = userId;
    this.name = name;
    this.email = email;
  }

  toJSON(): object {
    return {
      userId: this.userId,
      name: this.name,
      email: this.email,
    };
  }

  static fromJSON(data: any): User {
    return new User(data.userId, data.name, data.email);
  }
}
