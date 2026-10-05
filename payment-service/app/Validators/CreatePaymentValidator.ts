import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { PaymentGateway } from 'App/Constants/PaymentGateway'

export default class CreatePaymentValidator {
  constructor(protected ctx: HttpContextContract) {}

  public data = {
    ...this.ctx.params,
    ...this.ctx.request.all(),
    orderId: this.ctx.request.input('orderId') || this.ctx.request.input('order_id'),
  }

  public schema = schema.create({
    orderId: schema.string.optional({ trim: true }, [rules.uuid()]),
    order_id: schema.string.optional({ trim: true }, [rules.uuid()]),
    gateway: schema.enum.optional(Object.values(PaymentGateway) as any),
  })

  public messages: CustomMessages = {
    'orderId.uuid': 'orderId must be a valid UUID',
    'order_id.uuid': 'order_id must be a valid UUID',
    'gateway.enum': 'Invalid payment gateway specified',
  }
}
