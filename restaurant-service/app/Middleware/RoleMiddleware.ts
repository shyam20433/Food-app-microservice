import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ApiResponse } from 'App/Response/ApiResponse'

export default class RoleMiddleware {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>, allowedRoles: string[]) {
    const user = (ctx.auth as any)?.user

    if (!user) {
      return ApiResponse.error(ctx, 'Unauthorized access', 401)
    }

    const userRoles: string[] = user.roles || []
    const hasPermission = allowedRoles.some((role) => userRoles.includes(role))

    if (!hasPermission) {
      return ApiResponse.error(
        ctx,
        `Forbidden: Required role(s) [${allowedRoles.join(', ')}] missing`,
        403
      )
    }

    await next()
  }
}
