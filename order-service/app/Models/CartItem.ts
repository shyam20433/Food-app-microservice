import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Cart from 'App/Models/Cart'

export default class CartItem extends BaseModel {
  public static table = 'cart_items'

  @column({ isPrimary: true })
  public id: string

  @column({ columnName: 'cart_id' })
  public cartId: string

  @column({ columnName: 'menu_item_id' })
  public menuItemId: string

  @column()
  public quantity: number

  @column()
  public price: number

  @column()
  public subtotal: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Cart, {
    foreignKey: 'cartId',
  })
  public cart: BelongsTo<typeof Cart>
}
