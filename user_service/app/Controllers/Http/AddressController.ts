import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { AddressRepository } from 'App/Repositories/AddressRepository'
import { ApiResponse } from 'App/Response/ApiResponse'
import CreateAddressValidator from 'App/Validators/CreateAddressValidator'
import UpdateAddressValidator from 'App/Validators/UpdateAddressValidator'
import IdParamValidator from 'App/Validators/IdParamValidator'

const addressRepo = new AddressRepository()

export default class AddressController {
  private async isOwnerOrAdmin(user: any, targetUserId: string): Promise<boolean> {
    if (!user) return false
    if (user.id === targetUserId) return true
    if (!user.roles) {
      await user.load('roles')
    }
    const userRoleNames = user.roles ? user.roles.map((r: any) => r.name) : []
    return userRoleNames.includes('ADMIN') || userRoleNames.includes('SUPER_ADMIN')
  }

  public async index(ctx: HttpContextContract) {
    const { request, auth } = ctx
    const currentUser = (auth as any)?.user
    const inputUserId = request.input('user_id')
    const targetUserId = inputUserId || currentUser?.id

    if (!targetUserId) {
      return ApiResponse.error(ctx, 'user_id is required', 400)
    }

    const canAccess = await this.isOwnerOrAdmin(currentUser, targetUserId)
    if (!canAccess) {
      return ApiResponse.error(ctx, 'Forbidden: You cannot access addresses for another user', 403)
    }

    const addresses = await addressRepo.findByUserId(targetUserId)
    return ApiResponse.success(ctx, addresses, 'Addresses fetched successfully')
  }

  public async show(ctx: HttpContextContract) {
    const { request, auth } = ctx
    const { id } = await request.validate(IdParamValidator)
    const currentUser = (auth)?.user

    const address = await addressRepo.findById(id)
    if (!address) {
      return ApiResponse.error(ctx, 'Address not found', 404)
    }

    const canAccess = await this.isOwnerOrAdmin(currentUser, address.userId)
    if (!canAccess) {
      return ApiResponse.error(ctx, 'Forbidden: You do not have permission to view this address', 403)
    }

    return ApiResponse.success(ctx, address, 'Address fetched successfully')
  }

  public async store(ctx: HttpContextContract) {
    const { request, auth } = ctx
    const payload = await request.validate(CreateAddressValidator)
    const currentUser = (auth as any)?.user
    const targetUserId = payload.user_id || request.input('user_id') || currentUser?.id

    if (!targetUserId) {
      return ApiResponse.error(ctx, 'user_id is required', 400)
    }

    const canAccess = await this.isOwnerOrAdmin(currentUser, targetUserId)
    if (!canAccess) {
      return ApiResponse.error(ctx, 'Forbidden: You cannot create an address for another user', 403)
    }

    const address = await addressRepo.insert({
      userId: targetUserId,
      label: payload.label,
      houseNo: payload.house_no,
      street: payload.street,
      area: payload.area,
      city: payload.city,
      state: payload.state,
      pincode: payload.pincode,
      isDefault: payload.is_default || false,
    })

    return ApiResponse.success(ctx, address, 'Address created successfully', {}, 201)
  }

  public async update(ctx: HttpContextContract) {
    const { request, auth } = ctx
    const { id } = await request.validate(IdParamValidator)
    const currentUser = (auth as any)?.user

    const address = await addressRepo.findById(id)
    if (!address) {
      return ApiResponse.error(ctx, 'Address not found', 404)
    }

    const canAccess = await this.isOwnerOrAdmin(currentUser, address.userId)
    if (!canAccess) {
      return ApiResponse.error(ctx, 'Forbidden: You do not have permission to update this address', 403)
    }

    const payload = await request.validate(UpdateAddressValidator)
    const updatedAddress = await addressRepo.update(id, {
      label: payload.label,
      houseNo: payload.house_no,
      street: payload.street,
      area: payload.area,
      city: payload.city,
      state: payload.state,
      pincode: payload.pincode,
      isDefault: payload.is_default,
      status: payload.status as any,
    })

    return ApiResponse.success(ctx, updatedAddress, 'Address updated successfully')
  }

  public async setDefault(ctx: HttpContextContract) {
    const { request, auth } = ctx
    const { id } = await request.validate(IdParamValidator)
    const currentUser = (auth as any)?.user

    const address = await addressRepo.findById(id)
    if (!address) {
      return ApiResponse.error(ctx, 'Address not found', 404)
    }

    const canAccess = await this.isOwnerOrAdmin(currentUser, address.userId)
    if (!canAccess) {
      return ApiResponse.error(ctx, 'Forbidden: You do not have permission to modify this address', 403)
    }

    const updatedAddress = await addressRepo.setDefault(id, address.userId)
    return ApiResponse.success(ctx, updatedAddress, 'Primary default address updated successfully')
  }

  public async destroy(ctx: HttpContextContract) {
    const { request, auth } = ctx
    const { id } = await request.validate(IdParamValidator)
    const currentUser = (auth as any)?.user

    const address = await addressRepo.findById(id)
    if (!address) {
      return ApiResponse.error(ctx, 'Address not found', 404)
    }

    const canAccess = await this.isOwnerOrAdmin(currentUser, address.userId)
    if (!canAccess) {
      return ApiResponse.error(ctx, 'Forbidden: You do not have permission to delete this address', 403)
    }

    const deletedAddress = await addressRepo.setStatus(id, 'DELETED' as any)
    return ApiResponse.success(ctx, deletedAddress, 'Address deleted successfully')
  }
}
