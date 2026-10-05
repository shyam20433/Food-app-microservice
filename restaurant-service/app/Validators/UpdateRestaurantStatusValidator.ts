import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { RestaurantStatus } from 'App/Constants/Status'

export default class UpdateRestaurantStatusValidator {
  constructor(protected ctx: HttpContextContract) {}

  public data = {
    ...this.ctx.params,
    ...this.ctx.request.all(),
  }

  public schema = schema.create({
    id: schema.string({}, [rules.uuid()]),
    status: schema.enum([RestaurantStatus.ENABLED, RestaurantStatus.DISABLED] as const),
  })

  public messages: CustomMessages = {
    'id.uuid': 'id must be a valid UUID',
    'status.required': 'Status is required',
    'status.enum': 'Status must be either ENABLED or DISABLED',
  }
}
