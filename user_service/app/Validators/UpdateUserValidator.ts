import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { UserStatus } from 'App/Constants/Status'

export default class UpdateUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  private targetUserId = this.ctx.params.id || (this.ctx.auth as any)?.user?.id

  public schema = schema.create({
    name: schema.string.optional({ trim: true }, [rules.maxLength(150)]),
    email: schema.string.optional({ trim: true }, [
      rules.email(),
      rules.maxLength(255),
      rules.unique({ table: 'users', column: 'email', whereNot: { id: this.targetUserId || '' } }),
    ]),
    phone_number: schema.string.optional({ trim: true }, [
      rules.maxLength(15),
      rules.unique({
        table: 'users',
        column: 'phone_number',
        whereNot: { id: this.targetUserId || '' },
      }),
    ]),
    profile_image: schema.string.optional({ trim: true }),
    status: schema.enum.optional(Object.values(UserStatus) as any),
  })

  public messages: CustomMessages = {
    'email.unique': 'Email is already taken',
    'phone_number.unique': 'Phone number is already taken',
  }
}
