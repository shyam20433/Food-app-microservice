import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { OrderService } from 'App/Services/OrderService'
import { ApiResponse } from 'App/Response/ApiResponse'
import CreateOrderValidator from 'App/Validators/CreateOrderValidator'
import PaginationValidator from 'App/Validators/PaginationValidator'

export default class OrderController {
  private orderService = new OrderService()

  public async store(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const payload = await ctx.request.validate(CreateOrderValidator)
    const token = ctx.request.header('authorization')

    const order = await this.orderService.checkout(user.id, payload, token)
    return ApiResponse.success(ctx, order, 'Order created successfully', {}, 201)
  }

  public async index(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const params = await ctx.request.validate(PaginationValidator)

    const result = await this.orderService.getUserOrders(user.id, params)
    return ApiResponse.success(ctx, result.data, 'Orders retrieved successfully', result.meta)
  }

  public async show(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { id } = await ctx.request.validate({
      schema: schema.create({ id: schema.string({}, [rules.uuid()]) }),
      messages: { 'id.uuid': 'id must be a valid UUID' },
      data: { ...ctx.params, ...ctx.request.all() },
    })

    const order = await this.orderService.getUserOrderById(user.id, id)
    return ApiResponse.success(ctx, order, 'Order retrieved successfully')
  }

  public async cancel(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { id } = await ctx.request.validate({
      schema: schema.create({ id: schema.string({}, [rules.uuid()]) }),
      messages: { 'id.uuid': 'id must be a valid UUID' },
      data: { ...ctx.params, ...ctx.request.all() },
    })

    const order = await this.orderService.cancelOrder(user.id, id)
    return ApiResponse.success(ctx, order, 'Order cancelled successfully')
  }
}
