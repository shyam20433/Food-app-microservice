import { DateTime } from 'luxon'
import {
  column,
  beforeCreate,
  beforeSave,
  BaseModel,
  hasMany,
  HasMany,
  manyToMany,
  ManyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'
import { v4 as uuidv4 } from 'uuid'
import Address from 'App/Models/Address'
import RefreshToken from 'App/Models/RefreshToken'
import Role from 'App/Models/Role'
import { UserStatus } from 'App/Constants/Status'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public email: string

  @column({ columnName: 'phone_number' })
  public phoneNumber: string

  @column({ serializeAs: null })
  public password: string

  @column({ columnName: 'profile_image' })
  public profileImage: string | null

  @column()
  public status: UserStatus

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Address, {
    foreignKey: 'userId',
  })
  public addresses: HasMany<typeof Address>

  @hasMany(() => RefreshToken, {
    foreignKey: 'userId',
  })
  public refreshTokens: HasMany<typeof RefreshToken>

  @manyToMany(() => Role, {
    pivotTable: 'user_roles',
    localKey: 'id',
    pivotForeignKey: 'user_id',
    relatedKey: 'name',
    pivotRelatedForeignKey: 'role_name',
    pivotTimestamps: true,
  })
  public roles: ManyToMany<typeof Role>

  @beforeCreate()
  public static assignUuid(user: User) {
    if (!user.id) {
      user.id = uuidv4()
    }
  }

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
