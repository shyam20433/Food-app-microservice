import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import { PaymentAttemptStatus } from 'App/Constants/PaymentAttemptStatus'
import Payment from 'App/Models/Payment'

export default class PaymentAttempt extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public paymentId: string

  @column()
  public attemptNumber: number

  @column()
  public amount: number

  @column()
  public status: PaymentAttemptStatus

  @column()
  public gatewayOrderId: string | null

  @column()
  public gatewayPaymentId: string | null

  @column()
  public failureCode: string | null

  @column()
  public failureMessage: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Payment, {
    foreignKey: 'paymentId',
  })
  public payment: BelongsTo<typeof Payment>
}
