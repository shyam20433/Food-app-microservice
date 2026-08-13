import jwt from 'jsonwebtoken'
import { UnauthorizedException } from '../Exceptions/CustomExceptions'

export class JwtService {
  private static get secret(): string {
    return process.env.JWT_SECRET || 'super_secret_jwt_key_adonis_user_service'
  }

  public static generateToken(payload: object, expiresIn: string = '1h'): string {
    return jwt.sign(payload, this.secret, { expiresIn } as any)
  }

  public static verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.secret)
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired access token')
    }
  }
}
