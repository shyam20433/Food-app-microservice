import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateCartItemValidator {
  constructor(protected ctx: HttpContextContract) {}

  public data = {
    ...this.ctx.params,
    ...this.ctx.request.all(),
  }

  public schema = schema.create({
    id: schema.string({}, [rules.uuid()]),
    quantity: schema.number([rules.range(1, 100)]),
  })

  public messages: CustomMessages = {
    'id.uuid': 'id must be a valid UUID',
    'id.required': 'id is required',
    'quantity.required': 'quantity is required',
    'quantity.range': 'quantity must be between 1 and 100',
  }
}
