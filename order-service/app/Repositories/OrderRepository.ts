import Order from 'App/Models/Order'
import { OrderStatus } from 'App/Constants/OrderStatus'
import { Status } from 'App/Constants/Status'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import { OrderNotFoundException } from 'App/Exceptions/CustomExceptions'

export class OrderRepository {
  public async create(
    data: Partial<Order>,
    options?: { client?: TransactionClientContract }
  ): Promise<Order> {
    const order = new Order()
    order.fill(data)
    if (options?.client) {
      order.useTransaction(options.client)
    }
    await order.save()
    return order
  }

  public async findById(id: string): Promise<Order | null> {
    return await Order.query()
      .where('id', id)
      .andWhere('status', '!=', Status.DELETED)
      .preload('items')
      .first()
  }

  public async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return await Order.query()
      .where('order_number', orderNumber)
      .andWhere('status', '!=', Status.DELETED)
      .preload('items')
      .first()
  }

  public async findByUserId(
    userId: string,
    options?: { page?: number; limit?: number }
  ): Promise<{ data: Order[]; meta: any }> {
    const page = options?.page || 1
    const limit = options?.limit || 20

    const paginated = await Order.query()
      .where('user_id', userId)
      .andWhere('status', '!=', Status.DELETED)
      .preload('items')
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    const json = paginated.toJSON()
    return {
      data: json.data as Order[],
      meta: json.meta,
    }
  }

  public async findByRestaurantId(
    restaurantId: string,
    options?: { page?: number; limit?: number; orderStatus?: OrderStatus }
  ): Promise<{ data: Order[]; meta: any }> {
    const page = options?.page || 1
    const limit = options?.limit || 20

    const query = Order.query()
      .where('restaurant_id', restaurantId)
      .andWhere('status', '!=', Status.DELETED)

    if (options?.orderStatus) {
      query.andWhere('order_status', options.orderStatus)
    }

    query.preload('items').orderBy('created_at', 'desc')

    const paginated = await query.paginate(page, limit)
    const json = paginated.toJSON()

    return {
      data: json.data as Order[],
      meta: json.meta,
    }
  }

  public async updateOrderStatus(
    id: string,
    orderStatus: OrderStatus,
    options?: { client?: TransactionClientContract }
  ): Promise<Order> {
    const order = await Order.query()
      .where('id', id)
      .andWhere('status', '!=', Status.DELETED)
      .first()

    if (!order) {
      throw new OrderNotFoundException()
    }
    if (options?.client) {
      order.useTransaction(options.client)
    }
    order.orderStatus = orderStatus
    await order.save()
    await order.load('items')
    return order
  }

  public async setStatus(id: string, status: Status): Promise<Order> {
    const order = await Order.find(id)
    if (!order) {
      throw new OrderNotFoundException()
    }
    order.status = status
    await order.save()
    return order
  }
}
