import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateAddressValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    user_id: schema.string.optional({ trim: true }, [rules.uuid()]),
    label: schema.string.optional({ trim: true }, [rules.maxLength(30)]),
    house_no: schema.string({ trim: true }, [rules.maxLength(100)]),
    street: schema.string({ trim: true }, [rules.maxLength(255)]),
    area: schema.string({ trim: true }, [rules.maxLength(255)]),
    city: schema.string({ trim: true }, [rules.maxLength(100)]),
    state: schema.string({ trim: true }, [rules.maxLength(100)]),
    pincode: schema.string({ trim: true }, [rules.maxLength(10)]),
    is_default: schema.boolean.optional(),
  })

  public messages: CustomMessages = {
    'house_no.required': 'House number is required',
    'street.required': 'Street is required',
    'area.required': 'Area is required',
    'city.required': 'City is required',
    'state.required': 'State is required',
    'pincode.required': 'Pincode is required',
  }
}
