import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateRefundValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    amount: schema.number([rules.unsigned()]),
    reason: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
  })

  public messages: CustomMessages = {
    'amount.required': 'Refund amount is required',
    'amount.unsigned': 'Refund amount must be a positive number',
  }
}
