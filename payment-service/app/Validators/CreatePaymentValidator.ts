import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { PaymentGateway } from 'App/Constants/PaymentGateway'

export default class CreatePaymentValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    order_id: schema.string({ trim: true }, [rules.uuid()]),
    gateway: schema.enum.optional(Object.values(PaymentGateway) as any),
  })

  public messages: CustomMessages = {
    'order_id.required': 'order_id is required',
    'order_id.uuid': 'order_id must be a valid UUID',
    'gateway.enum': 'Invalid payment gateway specified',
  }
}
