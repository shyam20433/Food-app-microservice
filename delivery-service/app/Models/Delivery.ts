import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import { DeliveryStatus } from 'App/Constants/DeliveryStatus'
import DeliveryPartner from 'App/Models/DeliveryPartner'
import DeliveryStatusHistory from 'App/Models/DeliveryStatusHistory'

export default class Delivery extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public orderId: string

  @column()
  public restaurantId: string

  @column()
  public deliveryPartnerId: string | null

  @column({
    prepare: (value: any) => (value ? JSON.stringify(value) : null),
    consume: (value: any) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  public pickupAddress: any

  @column({
    prepare: (value: any) => (value ? JSON.stringify(value) : null),
    consume: (value: any) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  public deliveryAddress: any

  @column()
  public status: DeliveryStatus

  @column.dateTime()
  public assignedAt: DateTime | null

  @column.dateTime()
  public pickedUpAt: DateTime | null

  @column.dateTime()
  public deliveredAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => DeliveryPartner, {
    foreignKey: 'deliveryPartnerId',
  })
  public partner: BelongsTo<typeof DeliveryPartner>

  @hasMany(() => DeliveryStatusHistory, {
    foreignKey: 'deliveryId',
  })
  public history: HasMany<typeof DeliveryStatusHistory>
}
