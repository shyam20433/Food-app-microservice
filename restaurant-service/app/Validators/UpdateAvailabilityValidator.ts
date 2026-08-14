import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateAvailabilityValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    is_available: schema.boolean(),
  })

  public messages: CustomMessages = {
    'is_available.required': 'is_available boolean field is required',
    'is_available.boolean': 'is_available must be a boolean value',
  }
}
