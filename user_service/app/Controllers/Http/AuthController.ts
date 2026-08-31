import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { UserRepository } from 'App/Repositories/UserRepository'
import { RefreshTokenRepository } from 'App/Repositories/RefreshTokenRepository'
import { UserRoleRepository } from 'App/Repositories/UserRoleRepository'
import { AddressRepository } from 'App/Repositories/AddressRepository'
import { JwtService } from 'App/Services/JwtService'
import { AuditLogService } from 'App/Services/AuditLogService'
import { ApiResponse } from 'App/Response/ApiResponse'
import RegisterValidator from 'App/Validators/RegisterValidator'
import RegisterFullValidator from 'App/Validators/RegisterFullValidator'
import LoginValidator from 'App/Validators/LoginValidator'
import Hash from '@ioc:Adonis/Core/Hash'
import Database from '@ioc:Adonis/Lucid/Database'
import jwtConfig from 'Config/jwt'
import ms from 'ms'
import { DateTime } from 'luxon'
import { Roles } from 'App/Constants/Roles'

export default class AuthController {
  private userRepo = new UserRepository()
  private refreshTokenRepo = new RefreshTokenRepository()
  private userRoleRepo = new UserRoleRepository()
  private addressRepo = new AddressRepository()

  public async register(ctx: HttpContextContract) {
    const { request } = ctx
    const payload = await request.validate(RegisterValidator)
    const user = await this.userRepo.insert({
      name: payload.name,
      email: payload.email,
      phoneNumber: payload.phone_number,
      password: payload.password,
    })

    const initialRoles: string[] =
      payload.roles && payload.roles.length > 0
        ? payload.roles
        : payload.role
        ? [payload.role]
        : [Roles.CUSTOMER]

    for (const rName of initialRoles) {
      await this.userRoleRepo.assignRole(user.id, rName)
    }

    await user.load('roles')

    const userRoles = user.roles.map((r) => r.name)
    const token = JwtService.generateToken({ id: user.id, email: user.email, roles: userRoles } as any)
    const refreshToken = JwtService.generateRefreshToken()

    const durationMs = ms(jwtConfig.refreshTokenExpiresIn as any)
    const expiresAt = DateTime.now().plus({
      milliseconds: typeof durationMs === 'number' ? durationMs : 604800000,
    })
    await this.refreshTokenRepo.insertToken(user.id, refreshToken, expiresAt)

    AuditLogService.log('USER_REGISTERED', {
      userId: user.id,
      ipAddress: request.ip(),
      userAgent: request.header('user-agent'),
    })

    return ApiResponse.success(
      ctx,
      {
        user,
        token,
        refreshToken,
      },
      'User registered successfully',
      {},
      201
    )
  }

  public async registerFull(ctx: HttpContextContract) {
    const { request } = ctx
    const payload = await request.validate(RegisterFullValidator)

    const trx = await Database.transaction()

    try {
      const user = await this.userRepo.insert(
        {
          name: payload.name,
          email: payload.email,
          phoneNumber: payload.phone_number,
          password: payload.password,
        },
        { client: trx }
      )

      const initialRoles: string[] =
        payload.roles && payload.roles.length > 0
          ? payload.roles
          : payload.role
          ? [payload.role]
          : [Roles.CUSTOMER]

      for (const rName of initialRoles) {
        await this.userRoleRepo.assignRole(user.id, rName, { client: trx })
      }

      if (payload.address) {
        await this.addressRepo.insert(
          {
            userId: user.id,
            label: payload.address.label || 'HOME',
            houseNo: payload.address.house_no,
            street: payload.address.street,
            area: payload.address.area,
            city: payload.address.city,
            state: payload.address.state,
            pincode: payload.address.pincode,
            isDefault: payload.address.is_default !== undefined ? payload.address.is_default : true,
          },
          { client: trx }
        )
      }

      await trx.commit()

      const fullUser = await this.userRepo.findById(user.id)

      const token = JwtService.generateToken({ id: user.id, email: user.email })
      const refreshToken = JwtService.generateRefreshToken()

      const durationMs = ms(jwtConfig.refreshTokenExpiresIn as any)
      const expiresAt = DateTime.now().plus({
        milliseconds: typeof durationMs === 'number' ? durationMs : 604800000,
      })
      await this.refreshTokenRepo.insertToken(user.id, refreshToken, expiresAt)

      AuditLogService.log('USER_REGISTERED_FULL', {
        userId: user.id,
        ipAddress: request.ip(),
        userAgent: request.header('user-agent'),
      })

      return ApiResponse.success(
        ctx,
        {
          user: fullUser,
          token,
          refreshToken,
        },
        'User, roles, and address created successfully with tokens generated',
        {},
        201
      )
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  public async login(ctx: HttpContextContract) {
    const { request } = ctx
    const payload = await request.validate(LoginValidator)

    const user = await this.userRepo.findByEmail(payload.email)
    if (!user) {
      return ApiResponse.error(ctx, 'Invalid credentials', 401)
    }

    const isPasswordValid = await Hash.verify(user.password, payload.password)
    if (!isPasswordValid) {
      return ApiResponse.error(ctx, 'Invalid credentials', 401)
    }

    await user.load('roles')
    const userRoles = user.roles.map((r) => r.name)
    const token = JwtService.generateToken({ id: user.id, email: user.email, roles: userRoles } as any)
    const refreshToken = JwtService.generateRefreshToken()

    const durationMs = ms(jwtConfig.refreshTokenExpiresIn as any)
    const expiresAt = DateTime.now().plus({
      milliseconds: typeof durationMs === 'number' ? durationMs : 604800000,
    })
    await this.refreshTokenRepo.insertToken(user.id, refreshToken, expiresAt)

    AuditLogService.log('USER_LOGIN', {
      userId: user.id,
      ipAddress: request.ip(),
      userAgent: request.header('user-agent'),
    })

    return ApiResponse.success(
      ctx,
      {
        user,
        token,
        refreshToken,
      },
      'Login successful'
    )
  }

  public async refresh(ctx: HttpContextContract) {
    const { request } = ctx
    const rawRefreshToken = request.input('refresh_token')
    if (!rawRefreshToken) {
      return ApiResponse.error(ctx, 'refresh_token is required', 400)
    }

    const record = await this.refreshTokenRepo.findByRawToken(rawRefreshToken)
    if (!record) {
      return ApiResponse.error(ctx, 'Invalid or expired refresh token', 401)
    }

    if (record.status !== 'ACTIVE' || record.expiresAt < DateTime.now()) {
      return ApiResponse.error(ctx, 'Refresh token has expired or been revoked', 401)
    }

    const user = await this.userRepo.findById(record.userId)
    if (!user) {
      return ApiResponse.error(ctx, 'User not found', 404)
    }

    const token = JwtService.generateToken({ id: user.id, email: user.email })
    const newRefreshToken = JwtService.generateRefreshToken()

    await this.refreshTokenRepo.deleteByRawToken(rawRefreshToken)

    const durationMs = ms(jwtConfig.refreshTokenExpiresIn as any)
    const expiresAt = DateTime.now().plus({
      milliseconds: typeof durationMs === 'number' ? durationMs : 604800000,
    })
    await this.refreshTokenRepo.insertToken(user.id, newRefreshToken, expiresAt)

    return ApiResponse.success(
      ctx,
      {
        token,
        refreshToken: newRefreshToken,
      },
      'Token refreshed successfully'
    )
  }

  public async logout(ctx: HttpContextContract) {
    const { request, auth } = ctx
    const rawRefreshToken = request.input('refresh_token')
    if (rawRefreshToken) {
      await this.refreshTokenRepo.deleteByRawToken(rawRefreshToken)
    }

    const currentUser = (auth as any)?.user
    AuditLogService.log('USER_LOGOUT', {
      userId: currentUser?.id,
      ipAddress: request.ip(),
      userAgent: request.header('user-agent'),
    })

    return ApiResponse.success(ctx, null, 'Logged out successfully')
  }

  public async me(ctx: HttpContextContract) {
    const { auth } = ctx
    const currentUser = (auth as any)?.user
    const userId = currentUser?.id
    if (!userId) {
      return ApiResponse.error(ctx, 'Unauthorized', 401)
    }

    const user = await this.userRepo.findById(userId)
    if (!user) {
      return ApiResponse.error(ctx, 'User profile not found', 404)
    }

    return ApiResponse.success(ctx, user, 'Current user profile fetched successfully')
  }
}
