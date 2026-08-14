import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { PartnerAvailability } from 'App/Constants/PartnerAvailability'

export default class AvailabilityValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    availability_status: schema.enum(Object.values(PartnerAvailability) as any),
    latitude: schema.number.optional([rules.range(-90, 90)]),
    longitude: schema.number.optional([rules.range(-180, 180)]),
  })

  public messages: CustomMessages = {
    'availability_status.required': 'availability_status is required',
    'availability_status.enum': 'Invalid availability_status specified',
  }
}
