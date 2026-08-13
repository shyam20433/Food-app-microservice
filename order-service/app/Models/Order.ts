import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import OrderItem from 'App/Models/OrderItem'
import { OrderStatus } from 'App/Constants/OrderStatus'
import { Status } from 'App/Constants/Status'

export default class Order extends BaseModel {
  public static table = 'orders'

  @column({ isPrimary: true })
  public id: string

  @column({ columnName: 'order_number' })
  public orderNumber: string

  @column({ columnName: 'user_id' })
  public userId: string

  @column({ columnName: 'restaurant_id' })
  public restaurantId: string

  @column({
    columnName: 'delivery_address',
    prepare: (value: any) => (typeof value === 'string' ? value : JSON.stringify(value)),
    consume: (value: any) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  public deliveryAddress: any

  @column({ columnName: 'total_amount' })
  public totalAmount: number

  @column({ columnName: 'order_status' })
  public orderStatus: OrderStatus

  @column()
  public status: Status

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => OrderItem, {
    foreignKey: 'orderId',
  })
  public items: HasMany<typeof OrderItem>
}
