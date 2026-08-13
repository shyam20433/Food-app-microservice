import OrderItem from 'App/Models/OrderItem'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'

export class OrderItemRepository {
  public async insert(
    data: Partial<OrderItem>,
    options?: { client?: TransactionClientContract }
  ): Promise<OrderItem> {
    const item = new OrderItem()
    item.fill(data)
    if (options?.client) {
      item.useTransaction(options.client)
    }
    await item.save()
    return item
  }

  public async insertBulk(
    itemsData: Partial<OrderItem>[],
    options?: { client?: TransactionClientContract }
  ): Promise<OrderItem[]> {
    if (options?.client) {
      return await OrderItem.createMany(itemsData, { client: options.client })
    }
    return await OrderItem.createMany(itemsData)
  }

  public async findByOrderId(orderId: string): Promise<OrderItem[]> {
    return await OrderItem.query().where('order_id', orderId)
  }
}
