import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import jwt from 'jsonwebtoken'
import Env from '@ioc:Adonis/Core/Env'
import { UnauthorizedException } from 'App/Exceptions/CustomExceptions'

export default class JwtAuth {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    const authHeader = ctx.request.header('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header')
    }

    const token = authHeader.replace('Bearer ', '').trim()
    const secret = Env.get('JWT_SECRET', 'super_secret_jwt_key_adonis_user_service')

    try {
      const decoded: any = jwt.verify(token, secret)
      const userId = decoded.id || decoded.userId
      if (!userId) {
        throw new UnauthorizedException('Invalid JWT payload claims')
      }

      ;(ctx as any).auth = {
        user: {
          id: userId,
          email: decoded.email,
          roles: decoded.roles || ['CUSTOMER'],
        },
      }
    } catch {
      throw new UnauthorizedException('Invalid or expired access token')
    }

    await next()
  }
}
