import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { DeliveryService } from 'App/Services/DeliveryService'
import { AssignmentService } from 'App/Services/AssignmentService'
import { ApiResponse } from 'App/Response/ApiResponse'
import CreateDeliveryValidator from 'App/Validators/CreateDeliveryValidator'
import PaginationValidator from 'App/Validators/PaginationValidator'
import IdParamValidator from 'App/Validators/IdParamValidator'
import { DeliveryStatus } from 'App/Constants/DeliveryStatus'

export default class DeliveryController {
  private deliveryService = new DeliveryService()
  private assignmentService = new AssignmentService()

  public async store(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const payload = await ctx.request.validate(CreateDeliveryValidator)
    const token = ctx.request.header('authorization')

    const delivery = await this.deliveryService.createDelivery(payload.order_id, user.id, token)
    return ApiResponse.success(ctx, delivery, 'Delivery created successfully', {}, 201)
  }

  public async show(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { id } = await ctx.request.validate(IdParamValidator)
    const token = ctx.request.header('authorization')

    const delivery = await this.deliveryService.getDeliveryById(id, user.id, user.roles, token)
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
    const { id } = await ctx.request.validate(IdParamValidator)

    const delivery = await this.deliveryService.acceptAssignment(id, user.id)
    return ApiResponse.success(ctx, delivery, 'Delivery assignment accepted successfully')
  }

  public async reject(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { id } = await ctx.request.validate(IdParamValidator)

    const delivery = await this.assignmentService.handlePartnerRejection(id, user.id)
    return ApiResponse.success(ctx, delivery, 'Delivery assignment rejected successfully')
  }

  public async pickup(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { id } = await ctx.request.validate(IdParamValidator)

    const delivery = await this.deliveryService.updateDeliveryStatus(id, user.id, DeliveryStatus.PICKED_UP)
    return ApiResponse.success(ctx, delivery, 'Delivery status updated to PICKED_UP')
  }

  public async outForDelivery(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { id } = await ctx.request.validate(IdParamValidator)

    const delivery = await this.deliveryService.updateDeliveryStatus(id, user.id, DeliveryStatus.OUT_FOR_DELIVERY)
    return ApiResponse.success(ctx, delivery, 'Delivery status updated to OUT_FOR_DELIVERY')
  }

  public async delivered(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { id } = await ctx.request.validate(IdParamValidator)

    const delivery = await this.deliveryService.updateDeliveryStatus(id, user.id, DeliveryStatus.DELIVERED)
    return ApiResponse.success(ctx, delivery, 'Delivery completed successfully (DELIVERED)')
  }

  public async getOtp(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { id } = await ctx.request.validate(IdParamValidator)

    const otp = await this.deliveryService.getDeliveryOtp(id, user.id)
    return ApiResponse.success(ctx, { delivery_id: id, otp }, 'Delivery OTP retrieved successfully')
  }

  public async verifyOtp(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { id } = await ctx.request.validate(IdParamValidator)
    const otp = ctx.request.input('otp')

    if (!otp) {
      return ctx.response.status(400).json({
        success: false,
        message: 'OTP is required in request body',
      })
    }

    const delivery = await this.deliveryService.verifyDeliveryOtp(id, user.id, String(otp))
    return ApiResponse.success(ctx, delivery, 'OTP verified successfully. Order delivered!')
  }

  public async getUnassigned(ctx: HttpContextContract) {
    const params = await ctx.request.validate(PaginationValidator)
    const result = await this.deliveryService.getUnassignedDeliveries(params)
    return ApiResponse.success(ctx, result.data, 'Unassigned deliveries retrieved successfully', result.meta)
  }

  public async selectDelivery(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { id } = await ctx.request.validate(IdParamValidator)

    const delivery = await this.deliveryService.selectDelivery(id, user.id)
    return ApiResponse.success(ctx, delivery, 'Delivery order claimed/selected successfully')
  }
}
