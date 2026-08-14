import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ForbiddenException, UnauthorizedException } from 'App/Exceptions/CustomExceptions'

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
    const hasPermission = allowedRoles.some((role) => userRoles.includes(role))

    if (!hasPermission) {
      throw new ForbiddenException(
        `User with roles [${userRoles.join(', ')}] does not have required permissions [${allowedRoles.join(', ')}]`
      )
    }

    await next()
  }
}
