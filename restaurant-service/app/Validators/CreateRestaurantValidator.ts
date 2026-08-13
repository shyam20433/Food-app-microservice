import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { RestaurantStatus } from 'App/Constants/Status'

export default class CreateRestaurantValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    owner_id: schema.string.optional({ trim: true }, [rules.uuid()]),
    name: schema.string({ trim: true }, [rules.maxLength(255)]),
    description: schema.string.optional({ trim: true }, [rules.maxLength(1000)]),
    phone_number: schema.string({ trim: true }, [rules.maxLength(50)]),
    email: schema.string({ trim: true }, [rules.email(), rules.maxLength(255)]),
    logo: schema.string.optional({ trim: true }, [rules.maxLength(500)]),
    opening_time: schema.string.optional({ trim: true }, [rules.maxLength(20)]),
    closing_time: schema.string.optional({ trim: true }, [rules.maxLength(20)]),
    delivery_radius: schema.number.optional([rules.range(0.1, 500)]),
    status: schema.enum.optional(Object.values(RestaurantStatus)),

    // Embedded address object required for atomic restaurant creation
    address: schema.object.optional().members({
      house_no: schema.string({ trim: true }, [rules.maxLength(100)]),
      street: schema.string({ trim: true }, [rules.maxLength(255)]),
      area: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
      city: schema.string({ trim: true }, [rules.maxLength(100)]),
      state: schema.string({ trim: true }, [rules.maxLength(100)]),
      pincode: schema.string({ trim: true }, [rules.maxLength(20)]),
      latitude: schema.number.optional([rules.range(-90, 90)]),
      longitude: schema.number.optional([rules.range(-180, 180)]),
    }),
  })

  public messages: CustomMessages = {
    'name.required': 'Restaurant name is required',
    'phone_number.required': 'Phone number is required',
    'email.required': 'Email is required',
    'email.email': 'Valid email address is required',
  }
}
