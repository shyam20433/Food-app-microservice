import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ForgotPasswordValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({ trim: true }, [rules.email()]),
    new_password: schema.string.optional({}, [rules.minLength(6)]),
  })

  public messages: CustomMessages = {
    'email.required': 'Email is required',
    'email.email': 'Valid email address is required',
    'new_password.minLength': 'New password must be at least 6 characters long',
  }
}
