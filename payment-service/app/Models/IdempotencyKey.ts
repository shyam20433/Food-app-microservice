import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class IdempotencyKey extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public key: string

  @column()
  public userId: string

  @column()
  public operation: string

  @column()
  public requestHash: string

  @column({
    prepare: (value: any) => (value ? JSON.stringify(value) : null),
    consume: (value: any) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  public response: any

  @column.dateTime()
  public expiresAt: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
