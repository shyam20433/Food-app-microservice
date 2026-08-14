import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateOrderValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    address_id: schema.string.optional({ trim: true }, [rules.uuid()]),
    delivery_address: schema.object.optional().members({
      label: schema.string.optional({ trim: true }),
      house_no: schema.string.optional({ trim: true }, [rules.maxLength(100)]),
      street: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
      area: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
      city: schema.string.optional({ trim: true }, [rules.maxLength(100)]),
      state: schema.string.optional({ trim: true }, [rules.maxLength(100)]),
      pincode: schema.string.optional({ trim: true }, [rules.maxLength(20)]),
      latitude: schema.number.optional([rules.range(-90, 90)]),
      longitude: schema.number.optional([rules.range(-180, 180)]),
    }),
  })

  public messages: CustomMessages = {
    'address_id.uuid': 'address_id must be a valid UUID',
  }
}
