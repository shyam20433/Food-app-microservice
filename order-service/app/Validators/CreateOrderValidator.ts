import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateOrderValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    delivery_address: schema.object().members({
      label: schema.string.optional({ trim: true }),
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
    'delivery_address.required': 'delivery_address snapshot object is required',
    'delivery_address.house_no.required': 'house_no is required in delivery_address',
    'delivery_address.street.required': 'street is required in delivery_address',
    'delivery_address.city.required': 'city is required in delivery_address',
    'delivery_address.state.required': 'state is required in delivery_address',
    'delivery_address.pincode.required': 'pincode is required in delivery_address',
  }
}
