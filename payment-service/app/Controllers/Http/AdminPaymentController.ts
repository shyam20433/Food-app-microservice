import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { PaymentService } from 'App/Services/PaymentService'
import { ApiResponse } from 'App/Response/ApiResponse'
import PaginationValidator from 'App/Validators/PaginationValidator'
import IdParamValidator from 'App/Validators/IdParamValidator'

export default class AdminPaymentController {
  private paymentService = new PaymentService()

  // GET /admin/payments — all payments across all users
  public async index(ctx: HttpContextContract) {
    const params = await ctx.request.validate(PaginationValidator)
    const result = await this.paymentService.getAllPayments(params)
    return ApiResponse.success(ctx, result.data, 'All payments retrieved successfully', result.meta)
  }

  // GET /admin/payments/:id — any specific payment by id
  public async show(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { id } = await ctx.request.validate(IdParamValidator)
    const payment = await this.paymentService.getPaymentById(user.id, user.roles, id)
    return ApiResponse.success(ctx, payment, 'Payment details retrieved successfully')
  }
}
