import { DateTime } from 'luxon'
import { column, beforeCreate, BaseModel, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import Restaurant from 'App/Models/Restaurant'
import { AddressStatus } from 'App/Constants/Status'

export default class RestaurantAddress extends BaseModel {
  public static table = 'restaurant_addresses'

  @column({ isPrimary: true })
  public id: string

  @column({ columnName: 'restaurant_id' })
  public restaurantId: string

  @column({ columnName: 'house_no' })
  public houseNo: string

  @column()
  public street: string

  @column()
  public area: string | null

  @column()
  public city: string

  @column()
  public state: string

  @column()
  public pincode: string

  @column()
  public latitude: number | null

  @column()
  public longitude: number | null

  @column()
  public status: AddressStatus

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Restaurant, {
    foreignKey: 'restaurantId',
  })
  public restaurant: BelongsTo<typeof Restaurant>

  @beforeCreate()
  public static assignUuid(address: RestaurantAddress) {
    if (!address.id) {
      address.id = uuidv4()
    }
  }
}
