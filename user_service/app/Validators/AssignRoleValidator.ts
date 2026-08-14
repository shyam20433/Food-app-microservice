import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AssignRoleValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    role_name: schema.string.optional({ trim: true }, [rules.maxLength(50)]),
    role: schema.string.optional({ trim: true }, [rules.maxLength(50)]),
    roles: schema.array.optional().members(schema.string({ trim: true }, [rules.maxLength(50)])),
  })

  public messages: CustomMessages = {
    'role_name.maxLength': 'role_name must not exceed 50 characters',
    'role.maxLength': 'role must not exceed 50 characters',
  }
}
