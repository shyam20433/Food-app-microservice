import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { JwtService } from 'App/Services/JwtService'
import { UnauthorizedException } from 'App/Exceptions/CustomExceptions'

export default class JwtAuth {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    const authHeader = ctx.request.header('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization Bearer token is missing')
    }

    const token = authHeader.split(' ')[1]
    const payload = JwtService.verifyToken(token)

    // Normalize user object on ctx.auth
    const userId = payload.id || payload.user_id || payload.sub
    if (!userId) {
      throw new UnauthorizedException('Invalid token payload: missing user identifier')
    }

    const userRoles = payload.roles || (payload.role ? [payload.role] : ['CUSTOMER'])

    ;(ctx as any).auth = {
      user: {
        id: userId,
        email: payload.email,
        roles: userRoles,
      },
    }

    await next()
  }
}
