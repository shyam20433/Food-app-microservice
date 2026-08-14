import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { VehicleType } from 'App/Constants/VehicleType'

export default class CreateDeliveryPartnerValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    vehicle_type: schema.enum(Object.values(VehicleType) as any),
    vehicle_number: schema.string({ trim: true }, [rules.maxLength(50)]),
    latitude: schema.number.optional([rules.range(-90, 90)]),
    longitude: schema.number.optional([rules.range(-180, 180)]),
  })

  public messages: CustomMessages = {
    'vehicle_type.required': 'vehicle_type is required',
    'vehicle_type.enum': 'Invalid vehicle_type specified',
    'vehicle_number.required': 'vehicle_number is required',
  }
}
