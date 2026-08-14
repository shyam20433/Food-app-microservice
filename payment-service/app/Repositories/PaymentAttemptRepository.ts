import PaymentAttempt from 'App/Models/PaymentAttempt'
import { PaymentAttemptStatus } from 'App/Constants/PaymentAttemptStatus'

export class PaymentAttemptRepository {
  public async create(
    data: Partial<PaymentAttempt>,
    options?: any
  ): Promise<PaymentAttempt> {
    const attempt = new PaymentAttempt()
    attempt.fill(data)
    if (options?.client) {
      attempt.useTransaction(options.client)
    }
    await attempt.save()
    return attempt
  }

  public async getNextAttemptNumber(paymentId: string, options?: any): Promise<number> {
    const lastAttempt = await PaymentAttempt.query(options)
      .where('payment_id', paymentId)
      .orderBy('attempt_number', 'desc')
      .first()

    return lastAttempt ? lastAttempt.attemptNumber + 1 : 1
  }

  public async updateStatus(
    id: string,
    status: PaymentAttemptStatus,
    data?: { gatewayOrderId?: string; gatewayPaymentId?: string; failureCode?: string; failureMessage?: string },
    options?: any
  ): Promise<PaymentAttempt> {
    const attempt = await PaymentAttempt.find(id, options)
    if (!attempt) {
      throw new Error('Payment attempt not found')
    }
    attempt.status = status
    if (data?.gatewayOrderId) attempt.gatewayOrderId = data.gatewayOrderId
    if (data?.gatewayPaymentId) attempt.gatewayPaymentId = data.gatewayPaymentId
    if (data?.failureCode) attempt.failureCode = data.failureCode
    if (data?.failureMessage) attempt.failureMessage = data.failureMessage

    if (options?.client) {
      attempt.useTransaction(options.client)
    }
    await attempt.save()
    return attempt
  }
}
