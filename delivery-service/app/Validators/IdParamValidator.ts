import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export class IdParamValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    id: schema.string({}, [rules.uuid()]),
  })

  public messages: CustomMessages = {
    'id.uuid': 'id must be a valid UUID',
    'id.required': 'id is required',
  }
}
