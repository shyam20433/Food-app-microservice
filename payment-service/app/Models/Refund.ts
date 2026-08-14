import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import { RefundStatus } from 'App/Constants/RefundStatus'
import Payment from 'App/Models/Payment'

export default class Refund extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public paymentId: string

  @column()
  public amount: number

  @column()
  public status: RefundStatus

  @column()
  public gatewayRefundId: string | null

  @column()
  public reason: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Payment, {
    foreignKey: 'paymentId',
  })
  public payment: BelongsTo<typeof Payment>
}
