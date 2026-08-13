import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { AddressStatus } from 'App/Constants/Status'

export default class CreateRestaurantAddressValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    house_no: schema.string({ trim: true }, [rules.maxLength(100)]),
    street: schema.string({ trim: true }, [rules.maxLength(255)]),
    area: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
    city: schema.string({ trim: true }, [rules.maxLength(100)]),
    state: schema.string({ trim: true }, [rules.maxLength(100)]),
    pincode: schema.string({ trim: true }, [rules.maxLength(20)]),
    latitude: schema.number.optional([rules.range(-90, 90)]),
    longitude: schema.number.optional([rules.range(-180, 180)]),
    status: schema.enum.optional(Object.values(AddressStatus)),
  })

  public messages: CustomMessages = {
    'house_no.required': 'House number is required',
    'street.required': 'Street is required',
    'city.required': 'City is required',
    'state.required': 'State is required',
    'pincode.required': 'Pincode is required',
  }
}
