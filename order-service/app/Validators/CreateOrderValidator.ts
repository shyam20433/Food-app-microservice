import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateOrderValidator {
  constructor(protected ctx: HttpContextContract) {}

  public data = {
    ...this.ctx.params,
    ...this.ctx.request.all(),
    addressId: this.ctx.request.input('addressId') || this.ctx.request.input('address_id'),
    deliveryAddress: this.ctx.request.input('deliveryAddress') || this.ctx.request.input('delivery_address'),
  }

  public schema = schema.create({
    addressId: schema.string.optional({ trim: true }, [rules.uuid()]),
    address_id: schema.string.optional({ trim: true }, [rules.uuid()]),
    deliveryAddress: schema.object.optional().members({
      label: schema.string.optional({ trim: true }),
      houseNo: schema.string.optional({ trim: true }, [rules.maxLength(100)]),
      house_no: schema.string.optional({ trim: true }, [rules.maxLength(100)]),
      street: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
      area: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
      city: schema.string.optional({ trim: true }, [rules.maxLength(100)]),
      state: schema.string.optional({ trim: true }, [rules.maxLength(100)]),
      pincode: schema.string.optional({ trim: true }, [rules.maxLength(20)]),
      latitude: schema.number.optional([rules.range(-90, 90)]),
      longitude: schema.number.optional([rules.range(-180, 180)]),
    }),
    delivery_address: schema.object.optional().members({
      label: schema.string.optional({ trim: true }),
      houseNo: schema.string.optional({ trim: true }, [rules.maxLength(100)]),
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
    'addressId.uuid': 'addressId must be a valid UUID',
    'address_id.uuid': 'address_id must be a valid UUID',
  }
}
