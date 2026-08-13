import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Order from 'App/Models/Order'

export default class OrderItem extends BaseModel {
  public static table = 'order_items'

  @column({ isPrimary: true })
  public id: string

  @column({ columnName: 'order_id' })
  public orderId: string

  @column({ columnName: 'menu_item_id' })
  public menuItemId: string

  @column()
  public name: string

  @column()
  public price: number

  @column()
  public quantity: number

  @column()
  public subtotal: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Order, {
    foreignKey: 'orderId',
  })
  public order: BelongsTo<typeof Order>
}
