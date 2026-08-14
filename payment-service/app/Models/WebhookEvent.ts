import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class WebhookEvent extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public gateway: string

  @column()
  public eventId: string

  @column()
  public eventType: string

  @column({
    prepare: (value: any) => (value ? JSON.stringify(value) : null),
    consume: (value: any) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  public payload: any

  @column()
  public status: 'RECEIVED' | 'PROCESSED' | 'FAILED'

  @column.dateTime()
  public processedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
