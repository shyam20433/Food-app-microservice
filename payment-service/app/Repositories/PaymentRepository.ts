import Payment from 'App/Models/Payment'
import { PaymentStatus } from 'App/Constants/PaymentStatus'

export class PaymentRepository {
  public async create(data: Partial<Payment>, options?: any): Promise<Payment> {
    const payment = new Payment()
    payment.fill(data)
    if (options?.client) {
      payment.useTransaction(options.client)
    }
    await payment.save()
    return payment
  }

  public async findById(id: string, options?: any): Promise<Payment | null> {
    const query = Payment.query(options).where('id', id).preload('attempts').preload('refunds')
    return await query.first()
  }

  public async findByOrderId(orderId: string, options?: any): Promise<Payment | null> {
    const query = Payment.query(options).where('order_id', orderId).preload('attempts').preload('refunds')
    return await query.first()
  }

  public async findByUserId(
    userId: string,
    options?: { page?: number; limit?: number }
  ): Promise<{ data: Payment[]; meta: any }> {
    const page = options?.page || 1
    const limit = options?.limit || 20

    const query = Payment.query().where('user_id', userId).preload('attempts').preload('refunds').orderBy('created_at', 'desc')
    const paginated = await query.paginate(page, limit)
    const json = paginated.toJSON()
    return { data: json.data as Payment[], meta: json.meta }
  }

  public async updateStatus(
    id: string,
    status: PaymentStatus,
    gatewayPaymentId?: string,
    options?: any
  ): Promise<Payment> {
    const payment = await Payment.find(id, options)
    if (!payment) {
      throw new Error('Payment not found for update')
    }
    payment.status = status
    if (gatewayPaymentId) {
      payment.gatewayPaymentId = gatewayPaymentId
    }
    if (options?.client) {
      payment.useTransaction(options.client)
    }
    await payment.save()
    return payment
  }
}
