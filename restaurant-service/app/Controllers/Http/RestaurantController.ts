import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { RestaurantService } from 'App/Services/RestaurantService'
import { ApiResponse } from 'App/Response/ApiResponse'
import CreateRestaurantValidator from 'App/Validators/CreateRestaurantValidator'
import UpdateRestaurantValidator from 'App/Validators/UpdateRestaurantValidator'
import UpdateRestaurantStatusValidator from 'App/Validators/UpdateRestaurantStatusValidator'
import PaginationValidator from 'App/Validators/PaginationValidator'

export default class RestaurantController {
  private restaurantService = new RestaurantService()

  public async store(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const payload = await ctx.request.validate(CreateRestaurantValidator)

    const restaurant = await this.restaurantService.createRestaurant(user.id, user.roles, payload)
    return ApiResponse.success(ctx, restaurant, 'Restaurant created successfully', {}, 201)
  }

  public async index(ctx: HttpContextContract) {
    const params = await ctx.request.validate(PaginationValidator)
    const result = await this.restaurantService.listRestaurants(params)
    return ApiResponse.success(ctx, result.data, 'Restaurants retrieved successfully', result.meta)
  }

  public async show(ctx: HttpContextContract) {
    const { id } = await ctx.request.validate({
      schema: schema.create({ id: schema.string({}, [rules.uuid()]) }),
      messages: { 'id.uuid': 'id must be a valid UUID' },
      data: { ...ctx.params, ...ctx.request.all() },
    })
    const restaurant = await this.restaurantService.getRestaurantById(id)
    return ApiResponse.success(ctx, restaurant, 'Restaurant retrieved successfully')
  }

  public async update(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { id } = await ctx.request.validate({
      schema: schema.create({ id: schema.string({}, [rules.uuid()]) }),
      messages: { 'id.uuid': 'id must be a valid UUID' },
      data: { ...ctx.params, ...ctx.request.all() },
    })
    const payload = await ctx.request.validate(UpdateRestaurantValidator)

    const restaurant = await this.restaurantService.updateRestaurant(
      id,
      user.id,
      user.roles,
      payload
    )
    return ApiResponse.success(ctx, restaurant, 'Restaurant updated successfully')
  }

  public async destroy(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { id } = await ctx.request.validate({
      schema: schema.create({ id: schema.string({}, [rules.uuid()]) }),
      messages: { 'id.uuid': 'id must be a valid UUID' },
      data: { ...ctx.params, ...ctx.request.all() },
    })

    const restaurant = await this.restaurantService.deleteRestaurant(id, user.id, user.roles)
    return ApiResponse.success(ctx, restaurant, 'Restaurant soft deleted successfully')
  }

  public async restore(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { id } = await ctx.request.validate({
      schema: schema.create({ id: schema.string({}, [rules.uuid()]) }),
      messages: { 'id.uuid': 'id must be a valid UUID' },
      data: { ...ctx.params, ...ctx.request.all() },
    })

    const restaurant = await this.restaurantService.restoreRestaurant(id, user.id, user.roles)
    return ApiResponse.success(ctx, restaurant, 'Restaurant restored successfully')
  }

  public async updateStatus(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { id } = await ctx.request.validate({
      schema: schema.create({ id: schema.string({}, [rules.uuid()]) }),
      messages: { 'id.uuid': 'id must be a valid UUID' },
      data: { ...ctx.params, ...ctx.request.all() },
    })
    const payload = await ctx.request.validate(UpdateRestaurantStatusValidator)

    const restaurant = await this.restaurantService.setRestaurantStatus(
      id,
      user.id,
      user.roles,
      payload.status as any
    )
    return ApiResponse.success(ctx, restaurant, 'Restaurant status updated successfully')
  }
}
