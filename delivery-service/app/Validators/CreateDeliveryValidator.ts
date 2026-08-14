import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateDeliveryValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    order_id: schema.string({ trim: true }, [rules.uuid()]),
  })

  public messages: CustomMessages = {
    'order_id.required': 'order_id is required',
    'order_id.uuid': 'order_id must be a valid UUID',
  }
}
