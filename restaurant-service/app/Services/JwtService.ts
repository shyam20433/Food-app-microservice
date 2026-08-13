import jwt, { SignOptions } from 'jsonwebtoken'
import { UnauthorizedException } from 'App/Exceptions/CustomExceptions'

export interface JwtPayload {
  id?: string
  userId?: string
  email: string
  roles?: string[]
}

export class JwtService {
  private static getSecret(): string {
    if (process.env.JWT_SECRET) {
      return process.env.JWT_SECRET
    }
    try {
      const Env = require('@ioc:Adonis/Core/Env').default
      return Env.get('JWT_SECRET', 'super_secret_jwt_key_adonis_user_service')
    } catch {
      return 'super_secret_jwt_key_adonis_user_service'
    }
  }

  public static generateToken(payload: JwtPayload): string {
    const options: SignOptions = { expiresIn: '15m' }
    return jwt.sign(payload, this.getSecret(), options)
  }

  public static verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.getSecret()) as JwtPayload
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired access token')
    }
  }

  public generateToken(payload: JwtPayload): string {
    return JwtService.generateToken(payload)
  }

  public verifyAccessToken(token: string): JwtPayload {
    return JwtService.verifyAccessToken(token)
  }
}

export default new JwtService()
