import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import CartItem from 'App/Models/CartItem'
import { CartStatus } from 'App/Constants/CartStatus'

export default class Cart extends BaseModel {
  public static table = 'carts'

  @column({ isPrimary: true })
  public id: string

  @column({ columnName: 'user_id' })
  public userId: string

  @column({ columnName: 'restaurant_id' })
  public restaurantId: string | null

  @column()
  public status: CartStatus

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => CartItem, {
    foreignKey: 'cartId',
  })
  public items: HasMany<typeof CartItem>
}
