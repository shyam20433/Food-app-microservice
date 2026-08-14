import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { CategoryStatus } from 'App/Constants/Status'

export default class CreateCategoryValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({ trim: true }, [rules.maxLength(255)]),
    description: schema.string.optional({ trim: true }, [rules.maxLength(1000)]),
    status: schema.enum.optional(Object.values(CategoryStatus)),
  })

  public messages: CustomMessages = {
    'name.required': 'Category name is required',
  }
}
