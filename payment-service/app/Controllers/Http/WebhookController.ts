import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { PaymentService } from 'App/Services/PaymentService'
import { ApiResponse } from 'App/Response/ApiResponse'

export default class WebhookController {
  private paymentService = new PaymentService()

  public async handleWebhook(ctx: HttpContextContract) {
    const gatewayName = ctx.params.gateway || 'MOCK'
    const headers = ctx.request.headers()
    const payload = ctx.request.all()

    const result = await this.paymentService.processWebhook(gatewayName, headers, payload)
    return ApiResponse.success(ctx, result, 'Webhook processed successfully')
  }
}
