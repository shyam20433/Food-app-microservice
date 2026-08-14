import { DateTime } from 'luxon'
import { column, BaseModel, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'
import Role from 'App/Models/Role'

export default class UserRole extends BaseModel {
  public static table = 'user_roles'

  @column({ columnName: 'user_id', isPrimary: true })
  public userId: string

  @column({ columnName: 'role_name', isPrimary: true })
  public roleName: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  public user: BelongsTo<typeof User>

  @belongsTo(() => Role, {
    foreignKey: 'roleName',
  })
  public role: BelongsTo<typeof Role>
}
