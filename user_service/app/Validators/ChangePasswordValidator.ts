import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ChangePasswordValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    old_password: schema.string(),
    new_password: schema.string({}, [rules.minLength(6)]),
  })

  public messages: CustomMessages = {
    'old_password.required': 'Old password is required',
    'new_password.minLength': 'New password must be at least 6 characters',
  }
}
