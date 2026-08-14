import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import { PaymentStatus } from 'App/Constants/PaymentStatus'
import { PaymentGateway } from 'App/Constants/PaymentGateway'
import PaymentAttempt from 'App/Models/PaymentAttempt'
import Refund from 'App/Models/Refund'

export default class Payment extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public orderId: string

  @column()
  public userId: string

  @column()
  public amount: number

  @column()
  public currency: string

  @column()
  public status: PaymentStatus

  @column()
  public gateway: PaymentGateway

  @column()
  public gatewayPaymentId: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => PaymentAttempt, {
    foreignKey: 'paymentId',
  })
  public attempts: HasMany<typeof PaymentAttempt>

  @hasMany(() => Refund, {
    foreignKey: 'paymentId',
  })
  public refunds: HasMany<typeof Refund>
}
