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
    'page.range': 'Page must be between 1 and 10000',
    'limit.range': 'Limit must be between 1 and 100',
  }
}
