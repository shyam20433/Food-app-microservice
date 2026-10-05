import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateAddressValidator {
  constructor(protected ctx: HttpContextContract) {}

  public data = {
    ...this.ctx.params,
    ...this.ctx.request.all(),
  }

  public schema = schema.create({
    id: schema.string({}, [rules.uuid()]),
    label: schema.string.optional({ trim: true }, [rules.maxLength(30)]),
    house_no: schema.string.optional({ trim: true }, [rules.maxLength(100)]),
    street: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
    area: schema.string.optional({ trim: true }, [rules.maxLength(255)]),
    city: schema.string.optional({ trim: true }, [rules.maxLength(100)]),
    state: schema.string.optional({ trim: true }, [rules.maxLength(100)]),
    pincode: schema.string.optional({ trim: true }, [rules.maxLength(10)]),
    is_default: schema.boolean.optional(),
    status: schema.enum.optional(['ENABLED', 'DELETED'] as const),
  })

  public messages: CustomMessages = {
    'id.uuid': 'id must be a valid UUID',
  }
}
