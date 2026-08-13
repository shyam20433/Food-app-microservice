import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { UnauthorizedException } from 'App/Exceptions/CustomExceptions'

export default class RoleMiddleware {
  public async handle(
    ctx: HttpContextContract,
    next: () => Promise<void>,
    allowedRoles: string[]
  ) {
    const user = (ctx as any).auth?.user
    if (!user) {
      throw new UnauthorizedException('Authentication required')
    }

    const userRoles: string[] = user.roles || []
    const hasRole = allowedRoles.some((role) => userRoles.includes(role))

    if (!hasRole) {
      throw new UnauthorizedException(
        `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`
      )
    }

    await next()
  }
}
