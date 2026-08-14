import { DateTime } from 'luxon'
import { column, beforeCreate, BaseModel, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import User from 'App/Models/User'
import { AddressStatus } from 'App/Constants/Status'

export default class Address extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column({ columnName: 'user_id' })
  public userId: string

  @column()
  public label: string | null

  @column({ columnName: 'house_no' })
  public houseNo: string | null

  @column()
  public street: string | null

  @column()
  public area: string | null

  @column()
  public city: string | null

  @column()
  public state: string | null

  @column()
  public pincode: string | null

  @column({ columnName: 'is_default' })
  public isDefault: boolean

  @column()
  public status: AddressStatus

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  public user: BelongsTo<typeof User>

  @beforeCreate()
  public static assignUuid(address: Address) {
    if (!address.id) {
      address.id = uuidv4()
    }
  }
}
