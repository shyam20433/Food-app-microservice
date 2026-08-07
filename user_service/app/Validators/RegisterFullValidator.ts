import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Roles } from 'App/Constants/Roles'

export default class RegisterFullValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({ trim: true }, [rules.maxLength(150)]),
    email: schema.string({ trim: true }, [
      rules.email(),
      rules.maxLength(255),
      rules.unique({ table: 'users', column: 'email' }),
    ]),
    phone_number: schema.string({ trim: true }, [
      rules.maxLength(15),
      rules.unique({ table: 'users', column: 'phone_number' }),
    ]),
    password: schema.string({}, [rules.minLength(6)]),
    role: schema.enum.optional(Object.values(Roles) as any),
    roles: schema.array.optional().members(schema.enum(Object.values(Roles) as any)),
    address: schema.object.optional().members({
      label: schema.string.optional({ trim: true }, [rules.maxLength(30)]),
      house_no: schema.string({ trim: true }, [rules.maxLength(100)]),
      street: schema.string({ trim: true }, [rules.maxLength(255)]),
      area: schema.string({ trim: true }, [rules.maxLength(255)]),
      city: schema.string({ trim: true }, [rules.maxLength(100)]),
      state: schema.string({ trim: true }, [rules.maxLength(100)]),
      pincode: schema.string({ trim: true }, [rules.maxLength(10)]),
      is_default: schema.boolean.optional(),
    }),
  })

  public messages: CustomMessages = {
    'email.unique': 'Email already exists',
    'phone_number.unique': 'Phone number already exists',
    'role.enum': 'Invalid role specified',
    'roles.*.enum': 'One or more specified roles are invalid',
    'address.house_no.required': 'Address house_no is required',
    'address.street.required': 'Address street is required',
    'address.city.required': 'Address city is required',
  }
}
