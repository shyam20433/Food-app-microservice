import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateAvailabilityValidator {
  constructor(protected ctx: HttpContextContract) {}

  public data = {
    ...this.ctx.params,
    ...this.ctx.request.all(),
  }

  public schema = schema.create({
    restaurantId: schema.string({}, [rules.uuid()]),
    itemId: schema.string({}, [rules.uuid()]),
    is_available: schema.boolean(),
  })

  public messages: CustomMessages = {
    'restaurantId.uuid': 'restaurantId must be a valid UUID',
    'itemId.uuid': 'itemId must be a valid UUID',
    'is_available.required': 'is_available boolean field is required',
    'is_available.boolean': 'is_available must be a boolean value',
  }
}
