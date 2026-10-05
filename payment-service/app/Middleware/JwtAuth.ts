import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import jwt from 'jsonwebtoken'

export default class JwtAuth {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    const authHeader = ctx.request.header('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ctx.response.status(401).json({
        success: false,
        message: 'Missing or invalid Authorization header',
      })
    }

    const token = authHeader.replace('Bearer ', '').trim()
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_adonis_user_service'

    try {
      const decoded: any = jwt.verify(token, secret)
      const userId = decoded.id || decoded.userId
      if (!userId) {
        return ctx.response.status(401).json({
          success: false,
          message: 'Invalid JWT payload claims',
        })
      }

      ;(ctx as any).auth = {
        user: {
          id: userId,
          email: decoded.email,
          roles: decoded.roles || ['CUSTOMER'],
        },
      }
    } catch {
      return ctx.response.status(401).json({
        success: false,
        message: 'Invalid or expired access token',
      })
    }

    await next()
  }
}
