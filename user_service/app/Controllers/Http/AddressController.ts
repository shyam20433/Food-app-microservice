import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { AddressRepository } from 'App/Repositories/AddressRepository'
import { ApiResponse } from 'App/Response/ApiResponse'
import CreateAddressValidator from 'App/Validators/CreateAddressValidator'
import UpdateAddressValidator from 'App/Validators/UpdateAddressValidator'
const addressRepo = new AddressRepository()
export default class AddressController {
  public async index(ctx: HttpContextContract) {
    const userId = (ctx.auth as any)?.user?.id || ctx.request.input('user_id')
    if (!userId) {
      return ApiResponse.error(ctx, 'user_id is required', 400)
    }

    const addresses = await addressRepo.findByUserId(userId)
    return ApiResponse.success(ctx, addresses, 'Addresses fetched successfully')
  }

  public async show(ctx: HttpContextContract) {
    const { id } = await ctx.request.validate({
      schema: schema.create({ id: schema.string({}, [rules.uuid()]) }),
      messages: { 'id.uuid': 'id must be a valid UUID' },
      data: { ...ctx.params, ...ctx.request.all() },
    })
    const address = await addressRepo.findById(id)
    if (!address) {
      return ApiResponse.error(ctx, 'Address not found', 404)
    }
    return ApiResponse.success(ctx, address, 'Address fetched successfully')
  }

  public async store(ctx: HttpContextContract) {
    const payload = await ctx.request.validate(CreateAddressValidator)
    const userId = (ctx.auth as any)?.user?.id || ctx.request.input('user_id')

    if (!userId) {
      return ApiResponse.error(ctx, 'user_id is required', 400)
    }

    const address = await addressRepo.insert({
      userId,
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
    const { id } = await ctx.request.validate({
      schema: schema.create({ id: schema.string({}, [rules.uuid()]) }),
      messages: { 'id.uuid': 'id must be a valid UUID' },
      data: { ...ctx.params, ...ctx.request.all() },
    })
    const payload = await ctx.request.validate(UpdateAddressValidator)
    const address = await addressRepo.update(id, {
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

    return ApiResponse.success(ctx, address, 'Address updated successfully')
  }

  public async setDefault(ctx: HttpContextContract) {
    const { id } = await ctx.request.validate({
      schema: schema.create({ id: schema.string({}, [rules.uuid()]) }),
      messages: { 'id.uuid': 'id must be a valid UUID' },
      data: { ...ctx.params, ...ctx.request.all() },
    })
    const userId = (ctx.auth as any)?.user?.id || ctx.request.input('user_id')
    if (!userId) {
      return ApiResponse.error(ctx, 'user_id is required', 400)
    }

    const address = await addressRepo.setDefault(id, userId)
    return ApiResponse.success(ctx, address, 'Primary default address updated successfully')
  }

  public async destroy(ctx: HttpContextContract) {
    const { id } = await ctx.request.validate({
      schema: schema.create({ id: schema.string({}, [rules.uuid()]) }),
      messages: { 'id.uuid': 'id must be a valid UUID' },
      data: { ...ctx.params, ...ctx.request.all() },
    })
    const address = await addressRepo.setStatus(id, 'DELETED' as any)
    return ApiResponse.success(ctx, address, 'Address deleted successfully')
  }
}
