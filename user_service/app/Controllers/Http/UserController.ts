import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { UserRepository } from 'App/Repositories/UserRepository'
import { UserRoleRepository } from 'App/Repositories/UserRoleRepository'
import { AuditLogService } from 'App/Services/AuditLogService'
import { ApiResponse } from 'App/Response/ApiResponse'
import { PaginationHelper } from 'App/Helpers/Pagination'
import { UserStatus } from 'App/Constants/Status'
import paginationConfig from 'Config/pagination'
import UpdateUserValidator from 'App/Validators/UpdateUserValidator'
import ChangePasswordValidator from 'App/Validators/ChangePasswordValidator'
import AssignRoleValidator from 'App/Validators/AssignRoleValidator'
import PaginationValidator from 'App/Validators/PaginationValidator'

export default class UserController {
  private userRepo = new UserRepository()
  private userRoleRepo = new UserRoleRepository()

  public async index(ctx: HttpContextContract) {
    const params = await ctx.request.validate(PaginationValidator)
    const page = params.page || 1
    const limit = params.limit || paginationConfig.defaultLimit
    const status = params.status as UserStatus

    const users = await this.userRepo.findAll({ status })
    const sliced = users.slice((page - 1) * limit, page * limit)
    const paginated = PaginationHelper.format(sliced, users.length, page, limit)
    return ApiResponse.success(ctx, paginated.data, 'Users fetched successfully', paginated.meta)
  }
  
  public async show(ctx: HttpContextContract) {
    const user = await this.userRepo.findById(ctx.params.id)
    if (!user) {
      return ApiResponse.error(ctx, 'User not found', 404)
    }
    return ApiResponse.success(ctx, user, 'User details fetched successfully')
  }

  public async update(ctx: HttpContextContract) {
    const payload = await ctx.request.validate(UpdateUserValidator)
    const currentUser = (ctx.auth as any)?.user
    const user = await this.userRepo.update(ctx.params.id, {
      name: payload.name,
      email: payload.email,
      phoneNumber: payload.phone_number,
      profileImage: payload.profile_image,
      status: payload.status as UserStatus,
    })

    AuditLogService.log('PROFILE_UPDATED', {
      userId: currentUser?.id,
      targetUserId: user.id,
      ipAddress: ctx.request.ip(),
    })

    return ApiResponse.success(ctx, user, 'User updated successfully')
  }

  public async destroy(ctx: HttpContextContract) {
    const user = await this.userRepo.setStatus(ctx.params.id, UserStatus.DELETED)
    return ApiResponse.success(ctx, user, 'User deleted successfully')
  }

  public async changePassword(ctx: HttpContextContract) {
    const payload = await ctx.request.validate(ChangePasswordValidator)
    const currentUser = (ctx.auth as any)?.user
    const userId = currentUser?.id || ctx.params.id

    await this.userRepo.changePassword(userId, payload.new_password)

    AuditLogService.log('PASSWORD_CHANGE', {
      userId,
      ipAddress: ctx.request.ip(),
    })

    return ApiResponse.success(ctx, null, 'Password changed successfully')
  }

  public async assignRole(ctx: HttpContextContract) {
    const payload = await ctx.request.validate(AssignRoleValidator)
    const currentUser = (ctx.auth as any)?.user
    const userId = ctx.params.id

    const user = await this.userRepo.findById(userId)
    if (!user) {
      return ApiResponse.error(ctx, 'User not found', 404)
    }

    const rolesToAssign: string[] =
      payload.roles && payload.roles.length > 0
        ? payload.roles
        : payload.role
        ? [payload.role]
        : payload.role_name
        ? [payload.role_name]
        : []

    if (rolesToAssign.length === 0) {
      return ApiResponse.error(ctx, 'role, role_name, or roles is required', 400)
    }

    for (const rName of rolesToAssign) {
      await this.userRoleRepo.assignRole(userId, rName)
      AuditLogService.log('ROLE_ASSIGNED', {
        userId: currentUser?.id,
        targetUserId: userId,
        roleName: rName,
      })
    }

    const updatedUser = await this.userRepo.findById(userId)
    return ApiResponse.success(
      ctx,
      updatedUser,
      `Role(s) [${rolesToAssign.join(', ')}] assigned successfully`
    )
  }

  public async removeRole(ctx: HttpContextContract) {
    const currentUser = (ctx.auth as any)?.user
    const userId = ctx.params.id
    const inputRole =
      ctx.request.input('role_name') || ctx.request.input('role') || ctx.params.roleName
    const inputRoles = ctx.request.input('roles')

    const rolesToRemove: string[] =
      Array.isArray(inputRoles) && inputRoles.length > 0 ? inputRoles : inputRole ? [inputRole] : []

    if (rolesToRemove.length === 0) {
      return ApiResponse.error(ctx, 'role_name, role, or roles is required', 400)
    }

    for (const rName of rolesToRemove) {
      await this.userRoleRepo.removeRole(userId, rName)
      AuditLogService.log('ROLE_REMOVED', {
        userId: currentUser?.id,
        targetUserId: userId,
        roleName: rName,
      })
    }

    const updatedUser = await this.userRepo.findById(userId)
    return ApiResponse.success(
      ctx,
      updatedUser,
      `Role(s) [${rolesToRemove.join(', ')}] removed successfully`
    )
  }
}
