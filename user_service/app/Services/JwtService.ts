import jwt, { SignOptions } from 'jsonwebtoken'
import Env from '@ioc:Adonis/Core/Env'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import { UnauthorizedException } from 'App/Exceptions/CustomExceptions'

export interface JwtPayload {
  id?: string
  userId?: string
  email: string
}

export class JwtService {
  private static getSecret(): string {
    return Env.get('JWT_SECRET', 'super_secret_jwt_key_adonis_user_service')
  }

  public static generateToken(payload: JwtPayload): string {
    const expiresIn = (Env.get('JWT_EXPIRES_IN', '15m') || '15m') as SignOptions['expiresIn']
    const options: SignOptions = { expiresIn }
    return jwt.sign(payload, this.getSecret(), options)
  }

  public static generateAccessToken(payload: JwtPayload): string {
    return this.generateToken(payload)
  }

  public static verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.getSecret()) as JwtPayload
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired access token')
    }
  }

  public static generateRefreshToken(): string {
    return uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '')
  }

  public static generateRefreshTokenString(): string {
    return this.generateRefreshToken()
  }

  public static getRefreshTokenExpiration(): DateTime {
    return DateTime.now().plus({ days: 7 })
  }

  public generateAccessToken(payload: JwtPayload): string {
    return JwtService.generateAccessToken(payload)
  }

  public verifyAccessToken(token: string): JwtPayload {
    return JwtService.verifyAccessToken(token)
  }

  public generateRefreshTokenString(): string {
    return JwtService.generateRefreshToken()
  }

  public getRefreshTokenExpiration(): DateTime {
    return JwtService.getRefreshTokenExpiration()
  }
}

export default new JwtService()
