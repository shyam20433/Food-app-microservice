import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ProcessPaymentValidator {
  constructor(protected ctx: HttpContextContract) {}

  public data = {
    ...this.ctx.params,
    ...this.ctx.request.all(),
  }

  public schema = schema.create({
    id: schema.string({}, [rules.uuid()]),
    action: schema.enum.optional(['SUCCESS', 'FAIL'] as const),
  })

  public messages: CustomMessages = {
    'id.uuid': 'id must be a valid UUID',
    'action.enum': 'action must be either SUCCESS or FAIL',
  }
}
