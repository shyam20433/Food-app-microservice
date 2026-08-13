import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateCartItemValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    restaurant_id: schema.string({ trim: true }, [rules.uuid()]),
    menu_item_id: schema.string({ trim: true }, [rules.uuid()]),
    quantity: schema.number([rules.range(1, 100)]),
  })

  public messages: CustomMessages = {
    'restaurant_id.required': 'restaurant_id is required',
    'restaurant_id.uuid': 'restaurant_id must be a valid UUID',
    'menu_item_id.required': 'menu_item_id is required',
    'menu_item_id.uuid': 'menu_item_id must be a valid UUID',
    'quantity.required': 'quantity is required',
    'quantity.range': 'quantity must be greater than 0 and up to 100',
  }
}
