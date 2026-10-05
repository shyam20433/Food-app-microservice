import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateRefundValidator {
  constructor(protected ctx: HttpContextContract) {}

  public data = {
    ...this.ctx.params,
    ...this.ctx.request.all(),
  }

  public schema = schema.create({
    id: schema.string({}, [rules.uuid()]),
    amount: schema.number([rules.unsigned()]),
    reason: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
  })

  public messages: CustomMessages = {
    'id.uuid': 'id must be a valid UUID',
    'amount.required': 'Refund amount is required',
    'amount.unsigned': 'Refund amount must be a positive number',
  }
}
