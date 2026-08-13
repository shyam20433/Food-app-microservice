import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { RestaurantStatus } from 'App/Constants/Status'

export default class UpdateRestaurantValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
    description: schema.string.optional({ trim: true }, [rules.maxLength(1000)]),
    phone_number: schema.string.optional({ trim: true }, [rules.maxLength(50)]),
    email: schema.string.optional({ trim: true }, [rules.email(), rules.maxLength(255)]),
    logo: schema.string.optional({ trim: true }, [rules.maxLength(500)]),
    opening_time: schema.string.optional({ trim: true }, [rules.maxLength(20)]),
    closing_time: schema.string.optional({ trim: true }, [rules.maxLength(20)]),
    delivery_radius: schema.number.optional([rules.range(0.1, 500)]),
    status: schema.enum.optional(Object.values(RestaurantStatus)),
  })

  public messages: CustomMessages = {
    'email.email': 'Valid email address is required',
  }
}
