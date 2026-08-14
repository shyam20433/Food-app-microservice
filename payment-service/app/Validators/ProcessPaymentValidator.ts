import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ProcessPaymentValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    action: schema.enum.optional(['SUCCESS', 'FAIL'] as const),
  })

  public messages: CustomMessages = {
    'action.enum': 'action must be either SUCCESS or FAIL',
  }
}
