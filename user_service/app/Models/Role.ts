import { DateTime } from 'luxon'
import { column, BaseModel, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'

export default class Role extends BaseModel {
  public static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  public name: string

  @column()
  public description: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @manyToMany(() => User, {
    pivotTable: 'user_roles',
    localKey: 'name',
    pivotForeignKey: 'role_name',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'user_id',
    pivotTimestamps: true,
  })
  public users: ManyToMany<typeof User>
}
