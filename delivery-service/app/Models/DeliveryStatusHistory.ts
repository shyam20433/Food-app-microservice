import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import { DeliveryStatus } from 'App/Constants/DeliveryStatus'
import Delivery from 'App/Models/Delivery'

export default class DeliveryStatusHistory extends BaseModel {
  public static table = 'delivery_status_history'

  @column({ isPrimary: true })
  public id: string

  @column()
  public deliveryId: string

  @column()
  public status: DeliveryStatus

  @column()
  public changedBy: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @belongsTo(() => Delivery, {
    foreignKey: 'deliveryId',
  })
  public delivery: BelongsTo<typeof Delivery>
}
