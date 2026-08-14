import Delivery from 'App/Models/Delivery'
import { DeliveryStatus } from 'App/Constants/DeliveryStatus'
import { DateTime } from 'luxon'

export class DeliveryRepository {
  public async create(data: Partial<Delivery>, options?: any): Promise<Delivery> {
    const delivery = new Delivery()
    delivery.fill(data)
    if (options?.client) {
      delivery.useTransaction(options.client)
    }
    await delivery.save()
    return delivery
  }

  public async findById(id: string, options?: any): Promise<Delivery | null> {
    return await Delivery.query(options)
      .where('id', id)
      .preload('partner')
      .preload('history', (hQuery) => hQuery.orderBy('created_at', 'asc'))
      .first()
  }

  public async findByOrderId(orderId: string, options?: any): Promise<Delivery | null> {
    return await Delivery.query(options)
      .where('order_id', orderId)
      .preload('partner')
      .preload('history', (hQuery) => hQuery.orderBy('created_at', 'asc'))
      .first()
  }

  public async findActiveByPartner(partnerId: string, options?: any): Promise<Delivery | null> {
    const activeStatuses = [
      DeliveryStatus.ASSIGNED,
      DeliveryStatus.ACCEPTED,
      DeliveryStatus.PICKED_UP,
      DeliveryStatus.OUT_FOR_DELIVERY,
    ]

    return await Delivery.query(options)
      .where('delivery_partner_id', partnerId)
      .whereIn('status', activeStatuses)
      .preload('partner')
      .preload('history', (hQuery) => hQuery.orderBy('created_at', 'asc'))
      .first()
  }

  public async findByPartnerHistory(
    partnerId: string,
    options?: { page?: number; limit?: number }
  ): Promise<{ data: Delivery[]; meta: any }> {
    const page = options?.page || 1
    const limit = options?.limit || 20

    const query = Delivery.query()
      .where('delivery_partner_id', partnerId)
      .preload('partner')
      .orderBy('created_at', 'desc')

    const paginated = await query.paginate(page, limit)
    const json = paginated.toJSON()
    return { data: json.data as Delivery[], meta: json.meta }
  }

  public async findByOrderIds(
    orderIds: string[],
    options?: { page?: number; limit?: number }
  ): Promise<{ data: Delivery[]; meta: any }> {
    const page = options?.page || 1
    const limit = options?.limit || 20

    const query = Delivery.query()
      .whereIn('order_id', orderIds)
      .preload('partner')
      .orderBy('created_at', 'desc')

    const paginated = await query.paginate(page, limit)
    const json = paginated.toJSON()
    return { data: json.data as Delivery[], meta: json.meta }
  }

  public async findAll(options?: { page?: number; limit?: number }): Promise<{ data: Delivery[]; meta: any }> {
    const page = options?.page || 1
    const limit = options?.limit || 20

    const query = Delivery.query().preload('partner').orderBy('created_at', 'desc')
    const paginated = await query.paginate(page, limit)
    const json = paginated.toJSON()
    return { data: json.data as Delivery[], meta: json.meta }
  }

  public async updateStatus(
    id: string,
    status: DeliveryStatus,
    partnerId?: string | null,
    options?: any
  ): Promise<Delivery> {
    const delivery = await Delivery.find(id, options)
    if (!delivery) throw new Error('Delivery record not found')

    delivery.status = status
    if (partnerId !== undefined) {
      delivery.deliveryPartnerId = partnerId
    }

    if (status === DeliveryStatus.ASSIGNED) {
      delivery.assignedAt = DateTime.now()
    } else if (status === DeliveryStatus.PICKED_UP) {
      delivery.pickedUpAt = DateTime.now()
    } else if (status === DeliveryStatus.DELIVERED) {
      delivery.deliveredAt = DateTime.now()
    }

    if (options?.client) {
      delivery.useTransaction(options.client)
    }
    await delivery.save()
    return delivery
  }
}
