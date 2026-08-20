import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { RestaurantService } from 'App/Services/RestaurantService'
import { ApiResponse } from 'App/Response/ApiResponse'
import CreateRestaurantAddressValidator from 'App/Validators/CreateRestaurantAddressValidator'
import UpdateRestaurantAddressValidator from 'App/Validators/UpdateRestaurantAddressValidator'

export default class RestaurantAddressController {
  private restaurantService = new RestaurantService()

  public async store(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { restaurantId } = await ctx.request.validate({
      schema: schema.create({ restaurantId: schema.string({}, [rules.uuid()]) }),
      messages: { 'restaurantId.uuid': 'restaurantId must be a valid UUID' },
      data: { ...ctx.params, ...ctx.request.all() },
    })
    const payload = await ctx.request.validate(CreateRestaurantAddressValidator)

    const address = await this.restaurantService.createAddress(
      restaurantId,
      user.id,
      user.roles,
      payload
    )
    return ApiResponse.success(ctx, address, 'Restaurant address saved successfully', {}, 201)
  }

  public async show(ctx: HttpContextContract) {
    const { restaurantId } = await ctx.request.validate({
      schema: schema.create({ restaurantId: schema.string({}, [rules.uuid()]) }),
      messages: { 'restaurantId.uuid': 'restaurantId must be a valid UUID' },
      data: { ...ctx.params, ...ctx.request.all() },
    })
    const address = await this.restaurantService.getAddress(restaurantId)
    return ApiResponse.success(ctx, address, 'Restaurant address retrieved successfully')
  }

  public async update(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { restaurantId } = await ctx.request.validate({
      schema: schema.create({ restaurantId: schema.string({}, [rules.uuid()]) }),
      messages: { 'restaurantId.uuid': 'restaurantId must be a valid UUID' },
      data: { ...ctx.params, ...ctx.request.all() },
    })
    const payload = await ctx.request.validate(UpdateRestaurantAddressValidator)

    const address = await this.restaurantService.updateAddress(
      restaurantId,
      user.id,
      user.roles,
      payload
    )
    return ApiResponse.success(ctx, address, 'Restaurant address updated successfully')
  }

  public async destroy(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { restaurantId } = await ctx.request.validate({
      schema: schema.create({ restaurantId: schema.string({}, [rules.uuid()]) }),
      messages: { 'restaurantId.uuid': 'restaurantId must be a valid UUID' },
      data: { ...ctx.params, ...ctx.request.all() },
    })

    const address = await this.restaurantService.deleteAddress(restaurantId, user.id, user.roles)
    return ApiResponse.success(ctx, address, 'Restaurant address soft deleted successfully')
  }

  public async restore(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { restaurantId } = await ctx.request.validate({
      schema: schema.create({ restaurantId: schema.string({}, [rules.uuid()]) }),
      messages: { 'restaurantId.uuid': 'restaurantId must be a valid UUID' },
      data: { ...ctx.params, ...ctx.request.all() },
    })

    const address = await this.restaurantService.restoreAddress(restaurantId, user.id, user.roles)
    return ApiResponse.success(ctx, address, 'Restaurant address restored successfully')
  }
}
