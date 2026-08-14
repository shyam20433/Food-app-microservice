import DeliveryStatusHistory from 'App/Models/DeliveryStatusHistory'
import { DeliveryStatus } from 'App/Constants/DeliveryStatus'

export class DeliveryStatusHistoryRepository {
  public async createHistory(
    deliveryId: string,
    status: DeliveryStatus,
    changedBy: string,
    options?: any
  ): Promise<DeliveryStatusHistory> {
    const history = new DeliveryStatusHistory()
    history.deliveryId = deliveryId
    history.status = status
    history.changedBy = changedBy

    if (options?.client) {
      history.useTransaction(options.client)
    }
    await history.save()
    return history
  }

  public async findByDeliveryId(deliveryId: string, options?: any): Promise<DeliveryStatusHistory[]> {
    return await DeliveryStatusHistory.query(options)
      .where('delivery_id', deliveryId)
      .orderBy('created_at', 'asc')
  }
}
