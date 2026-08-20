import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { RestaurantStatus } from 'App/Constants/Status'

export default class PaginationValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    page: schema.number.optional([rules.range(1, 10000)]),
    limit: schema.number.optional([rules.range(1, 100)]),
    search: schema.string.optional({ trim: true }),
    status: schema.enum.optional(Object.values(RestaurantStatus)),
  })

  public messages: CustomMessages = {
    'page.number': 'page must be a valid number',
    'page.range': 'Page must be between 1 and 10000',
    'limit.number': 'limit must be a valid number',
    'limit.range': 'Limit must be between 1 and 100',
  }
}
