import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { OrderStatus } from 'App/Constants/OrderStatus'

export default class UpdateOrderStatusValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    status: schema.enum(Object.values(OrderStatus)),
  })

  public messages: CustomMessages = {
    'status.required': 'status is required',
    'status.enum': 'Invalid order status value',
  }
}
