import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PaginationValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    page: schema.number.optional([rules.range(1, 10000)]),
    limit: schema.number.optional([rules.range(1, 100)]),
    status: schema.string.optional({ trim: true }),
  })

  public messages: CustomMessages = {
    'page.number': 'page must be a valid number',
    'page.range': 'page must be between 1 and 10000',
    'limit.number': 'limit must be a valid number',
    'limit.range': 'limit must be between 1 and 100',
  }
}
