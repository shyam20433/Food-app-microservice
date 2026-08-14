import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import { PartnerAvailability } from 'App/Constants/PartnerAvailability'
import { VehicleType } from 'App/Constants/VehicleType'
import { Status } from 'App/Constants/Status'
import Delivery from 'App/Models/Delivery'

export default class DeliveryPartner extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public userId: string

  @column()
  public vehicleType: VehicleType

  @column()
  public vehicleNumber: string

  @column()
  public latitude: number

  @column()
  public longitude: number

  @column()
  public availabilityStatus: PartnerAvailability

  @column()
  public status: Status

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Delivery, {
    foreignKey: 'deliveryPartnerId',
  })
  public deliveries: HasMany<typeof Delivery>
}
