import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class IdParamValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    id: schema.string({}, [rules.uuid()]),
  })

  public data = {
    ...this.ctx.params,
    ...this.ctx.request.all(),
  }

  public messages: CustomMessages = {
    'id.uuid': 'id must be a valid UUID',
    'id.required': 'id is required',
  }
}
