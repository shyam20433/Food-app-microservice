import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { RestaurantStatus } from 'App/Constants/Status'

export default class UpdateRestaurantStatusValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    status: schema.enum([RestaurantStatus.ENABLED, RestaurantStatus.DISABLED] as const),
  })

  public messages: CustomMessages = {
    'status.required': 'Status is required',
    'status.enum': 'Status must be either ENABLED or DISABLED. Soft deletion must be performed via DELETE /restaurants/:id',
  }
}
