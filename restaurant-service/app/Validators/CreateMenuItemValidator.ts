import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { MenuItemStatus } from 'App/Constants/Status'

export default class CreateMenuItemValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    category_id: schema.string({ trim: true }, [rules.uuid()]),
    name: schema.string({ trim: true }, [rules.maxLength(255)]),
    description: schema.string.optional({ trim: true }, [rules.maxLength(1000)]),
    price: schema.number([rules.range(0.01, 100000)]),
    image: schema.string.optional({ trim: true }, [rules.maxLength(500)]),
    is_vegetarian: schema.boolean.optional(),
    preparation_time: schema.number.optional([rules.range(1, 1440)]),
    is_available: schema.boolean.optional(),
    status: schema.enum.optional(Object.values(MenuItemStatus)),
  })

  public messages: CustomMessages = {
    'category_id.required': 'Category ID is required',
    'category_id.uuid': 'Category ID must be a valid UUID',
    'name.required': 'Menu item name is required',
    'price.required': 'Price is required',
    'price.range': 'Price must be greater than 0',
  }
}
