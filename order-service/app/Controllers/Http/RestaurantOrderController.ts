import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { OrderService } from 'App/Services/OrderService'
import { ApiResponse } from 'App/Response/ApiResponse'
import PaginationValidator from 'App/Validators/PaginationValidator'
import { OrderStatus } from 'App/Constants/OrderStatus'
import { BadRequestException } from 'App/Exceptions/CustomExceptions'

export default class RestaurantOrderController {
  private orderService = new OrderService()

  public async index(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const restaurantId = ctx.request.input('restaurant_id') || ctx.request.input('restaurantId')

    if (!restaurantId) {
      throw new BadRequestException('restaurant_id query parameter is required')
    }

    const params = await ctx.request.validate(PaginationValidator)
    const result = await this.orderService.getRestaurantOrders(
      user.id,
      user.roles,
      restaurantId,
      params
    )
    return ApiResponse.success(ctx, result.data, 'Restaurant orders retrieved successfully', result.meta)
  }

  public async show(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const orderId = ctx.params.id
    const restaurantId = ctx.request.input('restaurant_id') || ctx.request.input('restaurantId')

    // Find order first to extract restaurantId if not explicitly provided in query
    let targetRestaurantId = restaurantId
    if (!targetRestaurantId) {
      const tempOrder = await this.orderService.getUserOrderById(user.id, orderId).catch(() => null)
      if (tempOrder) {
        targetRestaurantId = tempOrder.restaurantId
      }
    }

    if (!targetRestaurantId) {
      throw new BadRequestException('restaurant_id query parameter is required')
    }

    const order = await this.orderService.getRestaurantOrderById(
      user.id,
      user.roles,
      targetRestaurantId,
      orderId
    )
    return ApiResponse.success(ctx, order, 'Restaurant order retrieved successfully')
  }

  public async confirm(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const orderId = ctx.params.id
    const restaurantId = ctx.request.input('restaurant_id') || ctx.request.input('restaurantId')

    let targetRestaurantId = restaurantId
    if (!targetRestaurantId) {
      const order = await this.orderService.getUserOrderById(user.id, orderId).catch(() => null)
      if (order) targetRestaurantId = order.restaurantId
    }

    if (!targetRestaurantId) {
      throw new BadRequestException('restaurant_id parameter is required')
    }

    const updatedOrder = await this.orderService.updateRestaurantOrderStatus(
      user.id,
      user.roles,
      targetRestaurantId,
      orderId,
      OrderStatus.CONFIRMED
    )
    return ApiResponse.success(ctx, updatedOrder, 'Order confirmed successfully')
  }

  public async reject(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const orderId = ctx.params.id
    const restaurantId = ctx.request.input('restaurant_id') || ctx.request.input('restaurantId')

    let targetRestaurantId = restaurantId
    if (!targetRestaurantId) {
      const order = await this.orderService.getUserOrderById(user.id, orderId).catch(() => null)
      if (order) targetRestaurantId = order.restaurantId
    }

    if (!targetRestaurantId) {
      throw new BadRequestException('restaurant_id parameter is required')
    }

    const updatedOrder = await this.orderService.updateRestaurantOrderStatus(
      user.id,
      user.roles,
      targetRestaurantId,
      orderId,
      OrderStatus.REJECTED
    )
    return ApiResponse.success(ctx, updatedOrder, 'Order rejected successfully')
  }

  public async preparing(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const orderId = ctx.params.id
    const restaurantId = ctx.request.input('restaurant_id') || ctx.request.input('restaurantId')

    let targetRestaurantId = restaurantId
    if (!targetRestaurantId) {
      const order = await this.orderService.getUserOrderById(user.id, orderId).catch(() => null)
      if (order) targetRestaurantId = order.restaurantId
    }

    if (!targetRestaurantId) {
      throw new BadRequestException('restaurant_id parameter is required')
    }

    const updatedOrder = await this.orderService.updateRestaurantOrderStatus(
      user.id,
      user.roles,
      targetRestaurantId,
      orderId,
      OrderStatus.PREPARING
    )
    return ApiResponse.success(ctx, updatedOrder, 'Order status updated to PREPARING')
  }

  public async ready(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const orderId = ctx.params.id
    const restaurantId = ctx.request.input('restaurant_id') || ctx.request.input('restaurantId')

    let targetRestaurantId = restaurantId
    if (!targetRestaurantId) {
      const order = await this.orderService.getUserOrderById(user.id, orderId).catch(() => null)
      if (order) targetRestaurantId = order.restaurantId
    }

    if (!targetRestaurantId) {
      throw new BadRequestException('restaurant_id parameter is required')
    }

    const updatedOrder = await this.orderService.updateRestaurantOrderStatus(
      user.id,
      user.roles,
      targetRestaurantId,
      orderId,
      OrderStatus.READY
    )
    return ApiResponse.success(ctx, updatedOrder, 'Order status updated to READY')
  }
}
