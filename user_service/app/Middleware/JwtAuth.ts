import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import JwtService from 'App/Services/JwtService'
import { UserRepository } from 'App/Repositories/UserRepository'
import { UserStatus } from 'App/Constants/Status'
import { UnauthorizedException, UserInactiveException } from 'App/Exceptions/CustomExceptions'

export default class JwtAuth {
  private userRepository = new UserRepository()

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

    const user = await this.userRepository.findById(userId)
    if (!user || user.status !== UserStatus.ENABLED) {
      throw new UserInactiveException('User not found or account is disabled')
    }

    ctx.auth = { user } as any

    await next()
  }
}
