import Refund from 'App/Models/Refund'
import { RefundStatus } from 'App/Constants/RefundStatus'

export class RefundRepository {
  public async create(data: Partial<Refund>, options?: any): Promise<Refund> {
    const refund = new Refund()
    refund.fill(data)
    if (options?.client) {
      refund.useTransaction(options.client)
    }
    await refund.save()
    return refund
  }

  public async findByPaymentId(paymentId: string, options?: any): Promise<Refund[]> {
    return await Refund.query(options).where('payment_id', paymentId).orderBy('created_at', 'desc')
  }

  public async getSuccessfulRefundsTotal(paymentId: string, options?: any): Promise<number> {
    const refunds = await Refund.query(options)
      .where('payment_id', paymentId)
      .where('status', RefundStatus.SUCCESS)

    return refunds.reduce((sum, r) => sum + Number(r.amount), 0)
  }

  public async updateStatus(
    id: string,
    status: RefundStatus,
    gatewayRefundId?: string,
    options?: any
  ): Promise<Refund> {
    const refund = await Refund.find(id, options)
    if (!refund) {
      throw new Error('Refund record not found')
    }
    refund.status = status
    if (gatewayRefundId) refund.gatewayRefundId = gatewayRefundId

    if (options?.client) {
      refund.useTransaction(options.client)
    }
    await refund.save()
    return refund
  }
}
