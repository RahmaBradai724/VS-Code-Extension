import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

export interface JwtPayload {
  userId: number;
  name: string;
  email: string;
}

/**
 * AuthService handles password hashing and JWT signing/verification.
 * Uses bcryptjs (pure JS, no native bindings) and jsonwebtoken.
 */
export class AuthService {
  /** salt rounds — 10 is the recommended default */
  private static readonly SALT_ROUNDS = 10;

  constructor(private readonly secret: string) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, AuthService.SALT_ROUNDS);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  signToken(payload: JwtPayload): string {
    // Token expires in 24 hours
    return jwt.sign(payload, this.secret, { expiresIn: '24h' });
  }

  verifyToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, this.secret) as JwtPayload;
    } catch {
      return null;
    }
  }
}
