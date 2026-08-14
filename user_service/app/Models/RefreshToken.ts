import { DateTime } from 'luxon'
import { column, beforeCreate, BaseModel, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import User from 'App/Models/User'
import { RefreshTokenStatus } from 'App/Constants/Status'

export default class RefreshToken extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column({ columnName: 'user_id' })
  public userId: string

  @column({ columnName: 'token_hash' })
  public tokenHash: string

  @column.dateTime({ columnName: 'expires_at' })
  public expiresAt: DateTime

  @column()
  public status: RefreshTokenStatus

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  public user: BelongsTo<typeof User>

  @beforeCreate()
  public static assignUuid(refreshToken: RefreshToken) {
    if (!refreshToken.id) {
      refreshToken.id = uuidv4()
    }
  }
}
