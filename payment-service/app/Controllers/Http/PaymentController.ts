import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { PaymentService } from 'App/Services/PaymentService'
import { ApiResponse } from 'App/Response/ApiResponse'
import CreatePaymentValidator from 'App/Validators/CreatePaymentValidator'
import ProcessPaymentValidator from 'App/Validators/ProcessPaymentValidator'
import CreateRefundValidator from 'App/Validators/CreateRefundValidator'
import PaginationValidator from 'App/Validators/PaginationValidator'

export default class PaymentController {
  private paymentService = new PaymentService()

  public async store(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const payload = await ctx.request.validate(CreatePaymentValidator)
    const token = ctx.request.header('authorization')

    const payment = await this.paymentService.createPayment(
      user.id,
      payload.order_id,
      payload.gateway,
      token
    )
    return ApiResponse.success(ctx, payment, 'Payment initiated successfully', {}, 201)
  }

  public async index(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const params = await ctx.request.validate(PaginationValidator)

    const result = await this.paymentService.getUserPayments(user.id, params)
    return ApiResponse.success(ctx, result.data, 'Payments retrieved successfully', result.meta)
  }

  public async show(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const paymentId = ctx.params.id

    const payment = await this.paymentService.getPaymentById(user.id, user.roles, paymentId)
    return ApiResponse.success(ctx, payment, 'Payment details retrieved successfully')
  }

  public async pay(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const paymentId = ctx.params.id
    const payload = await ctx.request.validate(ProcessPaymentValidator)

    const payment = await this.paymentService.processMockPayment(
      user.id,
      paymentId,
      payload.action || 'SUCCESS'
    )
    return ApiResponse.success(ctx, payment, `Mock payment execution: ${payment.status}`)
  }

  public async refund(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const paymentId = ctx.params.id
    const payload = await ctx.request.validate(CreateRefundValidator)

    const refund = await this.paymentService.requestRefund(
      user.id,
      user.roles,
      paymentId,
      payload.amount,
      payload.reason
    )
    return ApiResponse.success(ctx, refund, 'Refund processed successfully', {}, 201)
  }
}
