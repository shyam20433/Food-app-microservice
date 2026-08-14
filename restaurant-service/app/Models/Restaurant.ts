import { DateTime } from 'luxon'
import {
  column,
  beforeCreate,
  BaseModel,
  hasOne,
  HasOne,
  hasMany,
  HasMany,
} from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import RestaurantAddress from 'App/Models/RestaurantAddress'
import Category from 'App/Models/Category'
import MenuItem from 'App/Models/MenuItem'
import { RestaurantStatus } from 'App/Constants/Status'

export default class Restaurant extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column({ columnName: 'owner_id' })
  public ownerId: string

  @column()
  public name: string

  @column()
  public description: string | null

  @column({ columnName: 'phone_number' })
  public phoneNumber: string

  @column()
  public email: string

  @column()
  public logo: string | null

  @column({ columnName: 'opening_time' })
  public openingTime: string | null

  @column({ columnName: 'closing_time' })
  public closingTime: string | null

  @column({ columnName: 'delivery_radius' })
  public deliveryRadius: number

  @column()
  public status: RestaurantStatus

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasOne(() => RestaurantAddress, {
    foreignKey: 'restaurantId',
  })
  public address: HasOne<typeof RestaurantAddress>

  @hasMany(() => Category, {
    foreignKey: 'restaurantId',
  })
  public categories: HasMany<typeof Category>

  @hasMany(() => MenuItem, {
    foreignKey: 'restaurantId',
  })
  public menuItems: HasMany<typeof MenuItem>

  @beforeCreate()
  public static assignUuid(restaurant: Restaurant) {
    if (!restaurant.id) {
      restaurant.id = uuidv4()
    }
  }
}
