import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import JwtService from 'App/Services/JwtService'
import { UnauthorizedException } from 'App/Exceptions/CustomExceptions'

export default class JwtAuth {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    const authHeader = ctx.request.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication token missing or malformed')
    }

    const token = authHeader.substring(7)
    const payload = JwtService.verifyAccessToken(token)
    const userId = payload.id || payload.userId

    if (!userId) {
      throw new UnauthorizedException('Invalid access token payload')
    }

    ctx.auth = {
      user: {
        id: userId,
        email: payload.email,
        roles: payload.roles || [],
      },
    } as any

    await next()
  }
}
