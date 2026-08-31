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
import IdParamValidator from 'App/Validators/IdParamValidator'

export default class UserController {
  private userRepo = new UserRepository()
  private userRoleRepo = new UserRoleRepository()

  public async index(ctx: HttpContextContract) {
    const { request } = ctx
    const queryParams = await request.validate(PaginationValidator)
    const page = queryParams.page || 1
    const limit = queryParams.limit || paginationConfig.defaultLimit
    const status = queryParams.status as UserStatus

    const users = await this.userRepo.findAll({ status })
    const sliced = users.slice((page - 1) * limit, page * limit)
    const paginated = PaginationHelper.format(sliced, users.length, page, limit)
    return ApiResponse.success(ctx, paginated.data, 'Users fetched successfully', paginated.meta)
  }

  public async show(ctx: HttpContextContract) {
    const { request } = ctx
    const { id } = await request.validate(IdParamValidator)
    const user = await this.userRepo.findById(id)
    if (!user) {
      return ApiResponse.error(ctx, 'User not found', 404)
    }
    return ApiResponse.success(ctx, user, 'User details fetched successfully')
  }

  public async update(ctx: HttpContextContract) {
    const { request, auth } = ctx
    const { id } = await request.validate(IdParamValidator)
    const payload = await request.validate(UpdateUserValidator)
    const currentUser = (auth as any)?.user

    const user = await this.userRepo.update(id, {
      name: payload.name,
      email: payload.email,
      phoneNumber: payload.phone_number,
      profileImage: payload.profile_image,
      status: payload.status as UserStatus,
    })

    AuditLogService.log('PROFILE_UPDATED', {
      userId: currentUser?.id,
      targetUserId: user.id,
      ipAddress: request.ip(),
    })

    return ApiResponse.success(ctx, user, 'User updated successfully')
  }

  public async destroy(ctx: HttpContextContract) {
    const { request } = ctx
    const { id } = await request.validate(IdParamValidator)
    const user = await this.userRepo.setStatus(id, UserStatus.DELETED)
    return ApiResponse.success(ctx, user, 'User deleted successfully')
  }

  public async changePassword(ctx: HttpContextContract) {
    const { request, auth, params } = ctx
    const payload = await request.validate(ChangePasswordValidator)
    const currentUser = (auth as any)?.user
    const userId = currentUser?.id || params.id

    await this.userRepo.changePassword(userId, payload.new_password)

    AuditLogService.log('PASSWORD_CHANGE', {
      userId,
      ipAddress: request.ip(),
    })

    return ApiResponse.success(ctx, null, 'Password changed successfully')
  }

  public async assignRole(ctx: HttpContextContract) {
    const { request, auth, params } = ctx
    const payload = await request.validate(AssignRoleValidator)
    const currentUser = (auth as any)?.user
    const userId = params.id

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
    const { request, auth, params } = ctx
    const currentUser = (auth as any)?.user
    const userId = params.id
    const inputRole =
      request.input('role_name') || request.input('role') || params.roleName
    const inputRoles = request.input('roles')

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
