import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateCartItemValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    quantity: schema.number([rules.range(1, 100)]),
  })

  public messages: CustomMessages = {
    'quantity.required': 'quantity is required',
    'quantity.range': 'quantity must be between 1 and 100',
  }
}
