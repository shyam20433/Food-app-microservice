import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { OrderService } from 'App/Services/OrderService'
import { ApiResponse } from 'App/Response/ApiResponse'
import PaginationValidator from 'App/Validators/PaginationValidator'
import { OrderStatus } from 'App/Constants/OrderStatus'

export default class RestaurantOrderController {
  private orderService = new OrderService()

  public async index(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const restaurantId = ctx.request.input('restaurant_id') || ctx.request.input('restaurantId')
    const params = await ctx.request.validate(PaginationValidator)

    const result = await this.orderService.getRestaurantOrders(user.id, user.roles, {
      ...params,
      restaurantId: restaurantId || undefined,
    })
    return ApiResponse.success(ctx, result.data, 'Restaurant orders retrieved successfully', result.meta)
  }

  public async show(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const orderId = ctx.params.id

    const order = await this.orderService.getRestaurantOrderById(user.id, user.roles, orderId)
    return ApiResponse.success(ctx, order, 'Restaurant order retrieved successfully')
  }

  public async confirm(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const orderId = ctx.params.id

    const updatedOrder = await this.orderService.updateRestaurantOrderStatus(
      user.id,
      user.roles,
      orderId,
      OrderStatus.CONFIRMED
    )
    return ApiResponse.success(ctx, updatedOrder, 'Order confirmed successfully')
  }

  public async reject(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const orderId = ctx.params.id

    const updatedOrder = await this.orderService.updateRestaurantOrderStatus(
      user.id,
      user.roles,
      orderId,
      OrderStatus.REJECTED
    )
    return ApiResponse.success(ctx, updatedOrder, 'Order rejected successfully')
  }

  public async preparing(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const orderId = ctx.params.id

    const updatedOrder = await this.orderService.updateRestaurantOrderStatus(
      user.id,
      user.roles,
      orderId,
      OrderStatus.PREPARING
    )
    return ApiResponse.success(ctx, updatedOrder, 'Order status updated to PREPARING')
  }

  public async ready(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const orderId = ctx.params.id

    const updatedOrder = await this.orderService.updateRestaurantOrderStatus(
      user.id,
      user.roles,
      orderId,
      OrderStatus.READY
    )
    return ApiResponse.success(ctx, updatedOrder, 'Order status updated to READY')
  }
}
