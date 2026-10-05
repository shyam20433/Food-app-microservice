import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { MenuItemStatus } from 'App/Constants/Status'

export default class UpdateMenuItemValidator {
  constructor(protected ctx: HttpContextContract) {}

  public data = {
    ...this.ctx.params,
    ...this.ctx.request.all(),
  }

  public schema = schema.create({
    restaurantId: schema.string({}, [rules.uuid()]),
    itemId: schema.string({}, [rules.uuid()]),
    category_id: schema.string.optional({ trim: true }, [rules.uuid()]),
    name: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
    description: schema.string.optional({ trim: true }, [rules.maxLength(1000)]),
    price: schema.number.optional([rules.range(0.01, 100000)]),
    image: schema.string.optional({ trim: true }, [rules.maxLength(500)]),
    is_vegetarian: schema.boolean.optional(),
    preparation_time: schema.number.optional([rules.range(1, 1440)]),
    is_available: schema.boolean.optional(),
    status: schema.enum.optional(Object.values(MenuItemStatus)),
  })

  public messages: CustomMessages = {
    'restaurantId.uuid': 'restaurantId must be a valid UUID',
    'itemId.uuid': 'itemId must be a valid UUID',
    'category_id.uuid': 'Category ID must be a valid UUID',
    'price.range': 'Price must be greater than 0',
  }
}
