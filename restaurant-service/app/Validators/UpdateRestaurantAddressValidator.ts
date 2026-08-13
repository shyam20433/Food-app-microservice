import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { AddressStatus } from 'App/Constants/Status'

export default class UpdateRestaurantAddressValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    house_no: schema.string.optional({ trim: true }, [rules.maxLength(100)]),
    street: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
    area: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
    city: schema.string.optional({ trim: true }, [rules.maxLength(100)]),
    state: schema.string.optional({ trim: true }, [rules.maxLength(100)]),
    pincode: schema.string.optional({ trim: true }, [rules.maxLength(20)]),
    latitude: schema.number.optional([rules.range(-90, 90)]),
    longitude: schema.number.optional([rules.range(-180, 180)]),
    status: schema.enum.optional(Object.values(AddressStatus)),
  })

  public messages: CustomMessages = {}
}
