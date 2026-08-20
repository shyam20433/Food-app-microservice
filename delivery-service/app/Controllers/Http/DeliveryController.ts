import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { DeliveryService } from 'App/Services/DeliveryService'
import { AssignmentService } from 'App/Services/AssignmentService'
import { ApiResponse } from 'App/Response/ApiResponse'
import CreateDeliveryValidator from 'App/Validators/CreateDeliveryValidator'
import PaginationValidator from 'App/Validators/PaginationValidator'
import { DeliveryStatus } from 'App/Constants/DeliveryStatus'

export default class DeliveryController {
  private deliveryService = new DeliveryService()
  private assignmentService = new AssignmentService()

  public async store(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const payload = await ctx.request.validate(CreateDeliveryValidator)
    const token = ctx.request.header('authorization')

    const delivery = await this.deliveryService.createDelivery(
      payload.order_id,
      user.id,
      token
    )
    return ApiResponse.success(ctx, delivery, 'Delivery created successfully', {}, 201)
  }

  public async show(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { id } = await ctx.request.validate({
      schema: schema.create({ id: schema.string({}, [rules.uuid()]) }),
      messages: { 'id.uuid': 'id must be a valid UUID' },
      data: { ...ctx.params, ...ctx.request.all() },
    })
    const token = ctx.request.header('authorization')

    const delivery = await this.deliveryService.getDeliveryById(
      id,
      user.id,
      user.roles,
      token
    )
    return ApiResponse.success(ctx, delivery, 'Delivery details retrieved successfully')
  }

  public async index(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const params = await ctx.request.validate(PaginationValidator)
    const token = ctx.request.header('authorization')

    const result = await this.deliveryService.getCustomerDeliveries(user.id, params, token)
    return ApiResponse.success(ctx, result.data, 'Deliveries retrieved successfully', result.meta)
  }

  public async accept(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { id } = await ctx.request.validate({
      schema: schema.create({ id: schema.string({}, [rules.uuid()]) }),
      messages: { 'id.uuid': 'id must be a valid UUID' },
      data: { ...ctx.params, ...ctx.request.all() },
    })

    const delivery = await this.deliveryService.acceptAssignment(id, user.id)
    return ApiResponse.success(ctx, delivery, 'Delivery assignment accepted successfully')
  }

  public async reject(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { id } = await ctx.request.validate({
      schema: schema.create({ id: schema.string({}, [rules.uuid()]) }),
      messages: { 'id.uuid': 'id must be a valid UUID' },
      data: { ...ctx.params, ...ctx.request.all() },
    })

    const delivery = await this.assignmentService.handlePartnerRejection(id, user.id)
    return ApiResponse.success(ctx, delivery, 'Delivery assignment rejected successfully')
  }

  public async pickup(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { id } = await ctx.request.validate({
      schema: schema.create({ id: schema.string({}, [rules.uuid()]) }),
      messages: { 'id.uuid': 'id must be a valid UUID' },
      data: { ...ctx.params, ...ctx.request.all() },
    })

    const delivery = await this.deliveryService.updateDeliveryStatus(
      id,
      user.id,
      DeliveryStatus.PICKED_UP
    )
    return ApiResponse.success(ctx, delivery, 'Delivery status updated to PICKED_UP')
  }

  public async outForDelivery(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { id } = await ctx.request.validate({
      schema: schema.create({ id: schema.string({}, [rules.uuid()]) }),
      messages: { 'id.uuid': 'id must be a valid UUID' },
      data: { ...ctx.params, ...ctx.request.all() },
    })

    const delivery = await this.deliveryService.updateDeliveryStatus(
      id,
      user.id,
      DeliveryStatus.OUT_FOR_DELIVERY
    )
    return ApiResponse.success(ctx, delivery, 'Delivery status updated to OUT_FOR_DELIVERY')
  }

  public async delivered(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { id } = await ctx.request.validate({
      schema: schema.create({ id: schema.string({}, [rules.uuid()]) }),
      messages: { 'id.uuid': 'id must be a valid UUID' },
      data: { ...ctx.params, ...ctx.request.all() },
    })

    const delivery = await this.deliveryService.updateDeliveryStatus(
      id,
      user.id,
      DeliveryStatus.DELIVERED
    )
    return ApiResponse.success(ctx, delivery, 'Delivery completed successfully (DELIVERED)')
  }
}
