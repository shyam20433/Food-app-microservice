import Database from '@ioc:Adonis/Lucid/Database'
import { PaymentRepository } from 'App/Repositories/PaymentRepository'
import { PaymentAttemptRepository } from 'App/Repositories/PaymentAttemptRepository'
import { RefundRepository } from 'App/Repositories/RefundRepository'
import { WebhookEventRepository } from 'App/Repositories/WebhookEventRepository'
import { OrderClient } from 'App/Services/OrderClient'
import { PaymentGatewayFactory } from 'App/Services/PaymentGateway/PaymentGatewayFactory'
import { PaymentStateService } from 'App/Services/PaymentStateService'
import Payment from 'App/Models/Payment'
import Refund from 'App/Models/Refund'
import { PaymentStatus } from 'App/Constants/PaymentStatus'
import { PaymentAttemptStatus } from 'App/Constants/PaymentAttemptStatus'
import { RefundStatus } from 'App/Constants/RefundStatus'
import { PaymentGateway } from 'App/Constants/PaymentGateway'
import { Roles } from 'App/Constants/Roles'
import {
  PaymentNotFoundException,
  PaymentAccessDeniedException,
  InvalidRefundAmountException,
  DuplicateWebhookException,
  BadRequestException,
} from 'App/Exceptions/CustomExceptions'

export class PaymentService {
  private paymentRepo = new PaymentRepository()
  private attemptRepo = new PaymentAttemptRepository()
  private refundRepo = new RefundRepository()
  private webhookRepo = new WebhookEventRepository()
  private orderClient = new OrderClient()

  public async createPayment(
    userId: string,
    orderId: string,
    gatewayName?: string,
    token?: string
  ): Promise<Payment> {
    // 1. Fetch authoritative order details from Order Service
    const order = await this.orderClient.getOrder(orderId, token)

    // 2. Verify order belongs to user and is payable
    await this.orderClient.verifyOrderPayable(order, userId)

    // 3. Check existing successful or pending payment for this order
    const existing = await this.paymentRepo.findByOrderId(orderId)
    if (existing) {
      if (existing.status === PaymentStatus.SUCCESS) {
        return existing
      }
      if (existing.status === PaymentStatus.PENDING || existing.status === PaymentStatus.PROCESSING) {
        return existing
      }
    }

    const selectedGateway = (gatewayName || PaymentGateway.MOCK) as PaymentGateway

    // 4. Create Payment record inside transaction
    const trx = await Database.transaction()

    try {
      const payment = await this.paymentRepo.create(
        {
          orderId: order.id,
          userId,
          amount: order.totalAmount,
          currency: 'INR',
          status: PaymentStatus.CREATED,
          gateway: selectedGateway,
        },
        { client: trx }
      )

      // 5. Create initial Payment Attempt
      const attempt = await this.attemptRepo.create(
        {
          paymentId: payment.id,
          attemptNumber: 1,
          amount: order.totalAmount,
          status: PaymentAttemptStatus.PENDING,
        },
        { client: trx }
      )

      // 6. Invoke Payment Gateway
      const gateway = PaymentGatewayFactory.getGateway(selectedGateway)
      const gatewayRes = await gateway.createPayment({
        paymentId: payment.id,
        orderId: order.id,
        amount: order.totalAmount,
        currency: 'INR',
        userId,
      })

      // 7. Update Attempt & Payment with gateway references
      await this.attemptRepo.updateStatus(
        attempt.id,
        PaymentAttemptStatus.PENDING,
        {
          gatewayOrderId: gatewayRes.gatewayOrderId,
          gatewayPaymentId: gatewayRes.gatewayPaymentId,
        },
        { client: trx }
      )

      await this.paymentRepo.updateStatus(
        payment.id,
        PaymentStatus.PENDING,
        gatewayRes.gatewayPaymentId,
        { client: trx }
      )

      await trx.commit()

      const result = await this.paymentRepo.findById(payment.id)
      return result!
    } catch (err) {
      await trx.rollback()
      throw err
    }
  }

  public async processMockPayment(
    userId: string,
    paymentId: string,
    action: 'SUCCESS' | 'FAIL' = 'SUCCESS'
  ): Promise<Payment> {
    const payment = await this.paymentRepo.findById(paymentId)
    if (!payment) throw new PaymentNotFoundException()
    if (payment.userId !== userId) throw new PaymentAccessDeniedException()

    // Validate State Transition
    const targetStatus = action === 'SUCCESS' ? PaymentStatus.SUCCESS : PaymentStatus.FAILED
    PaymentStateService.validateTransition(payment.status, targetStatus)

    const nextAttemptNo = await this.attemptRepo.getNextAttemptNumber(payment.id)

    const trx = await Database.transaction()

    try {
      const attemptStatus =
        action === 'SUCCESS' ? PaymentAttemptStatus.SUCCESS : PaymentAttemptStatus.FAILED

      await this.attemptRepo.create(
        {
          paymentId: payment.id,
          attemptNumber: nextAttemptNo,
          amount: payment.amount,
          status: attemptStatus,
          gatewayPaymentId: payment.gatewayPaymentId || `mock_pay_${Date.now()}`,
          failureCode: action === 'FAIL' ? 'CARD_DECLINED' : undefined,
          failureMessage: action === 'FAIL' ? 'Card was declined by issuing bank' : undefined,
        },
        { client: trx }
      )

      await this.paymentRepo.updateStatus(
        payment.id,
        targetStatus,
        payment.gatewayPaymentId || `mock_pay_${Date.now()}`,
        { client: trx }
      )

      await trx.commit()

      const updated = await this.paymentRepo.findById(payment.id)
      return updated!
    } catch (err) {
      await trx.rollback()
      throw err
    }
  }

  public async requestRefund(
    userId: string,
    roles: string[],
    paymentId: string,
    amount: number,
    reason?: string
  ): Promise<Refund> {
    const payment = await this.paymentRepo.findById(paymentId)
    if (!payment) throw new PaymentNotFoundException()

    const isAdmin = roles.includes(Roles.ADMIN) || roles.includes(Roles.SUPER_ADMIN)
    if (!isAdmin && payment.userId !== userId) {
      throw new PaymentAccessDeniedException()
    }

    if (payment.status !== PaymentStatus.SUCCESS && payment.status !== PaymentStatus.PARTIALLY_REFUNDED) {
      throw new BadRequestException(`Cannot refund payment in status '${payment.status}'`)
    }

    const previousRefundsTotal = await this.refundRepo.getSuccessfulRefundsTotal(payment.id)
    const remainingAmount = Math.round((Number(payment.amount) - previousRefundsTotal) * 100) / 100

    if (amount <= 0 || amount > remainingAmount) {
      throw new InvalidRefundAmountException(
        `Requested refund amount ₹${amount} exceeds max remaining refundable amount ₹${remainingAmount}`
      )
    }

    const gateway = PaymentGatewayFactory.getGateway(payment.gateway)

    const trx = await Database.transaction()

    try {
      const refundRecord = await this.refundRepo.create(
        {
          paymentId: payment.id,
          amount,
          status: RefundStatus.PENDING,
          reason,
        },
        { client: trx }
      )

      const gatewayRefundRes = await gateway.createRefund({
        paymentId: payment.id,
        gatewayPaymentId: payment.gatewayPaymentId || '',
        amount,
        reason,
      })

      const refundStatus =
        gatewayRefundRes.status === 'SUCCESS' ? RefundStatus.SUCCESS : RefundStatus.FAILED

      await this.refundRepo.updateStatus(
        refundRecord.id,
        refundStatus,
        gatewayRefundRes.gatewayRefundId,
        { client: trx }
      )

      if (refundStatus === RefundStatus.SUCCESS) {
        const newTotalRefunded = Math.round((previousRefundsTotal + amount) * 100) / 100
        const isFullRefund = newTotalRefunded >= Number(payment.amount)
        const targetPaymentStatus = isFullRefund
          ? PaymentStatus.REFUNDED
          : PaymentStatus.PARTIALLY_REFUNDED

        PaymentStateService.validateTransition(payment.status, targetPaymentStatus)
        await this.paymentRepo.updateStatus(payment.id, targetPaymentStatus, undefined, { client: trx })
      }

      await trx.commit()

      return (await Refund.find(refundRecord.id))!
    } catch (err) {
      await trx.rollback()
      throw err
    }
  }

  public async processWebhook(
    gatewayName: string,
    headers: Record<string, any>,
    payload: any
  ): Promise<any> {
    const gateway = PaymentGatewayFactory.getGateway(gatewayName)
    const verification = await gateway.verifyWebhook(headers, payload)

    // Deduplicate Webhook event_id
    const existingEvent = await this.webhookRepo.findByGatewayAndEventId(gatewayName, verification.eventId)
    if (existingEvent) {
      throw new DuplicateWebhookException(`Webhook event '${verification.eventId}' already processed`)
    }

    const eventRecord = await this.webhookRepo.create({
      gateway: gatewayName,
      eventId: verification.eventId,
      eventType: verification.eventType,
      payload,
      status: 'RECEIVED',
    })

    try {
      if (verification.gatewayPaymentId) {
        const payment = await Payment.findBy('gateway_payment_id', verification.gatewayPaymentId)
        if (payment) {
          const targetStatus =
            verification.status === 'SUCCESS' ? PaymentStatus.SUCCESS : PaymentStatus.FAILED
          PaymentStateService.validateTransition(payment.status, targetStatus)
          await this.paymentRepo.updateStatus(payment.id, targetStatus)
        }
      }

      await this.webhookRepo.markProcessed(eventRecord.id, 'PROCESSED')
      return { eventId: verification.eventId, processed: true }
    } catch (err) {
      await this.webhookRepo.markProcessed(eventRecord.id, 'FAILED')
      throw err
    }
  }

  public async getUserPayments(
    userId: string,
    options?: { page?: number; limit?: number }
  ): Promise<{ data: Payment[]; meta: any }> {
    return await this.paymentRepo.findByUserId(userId, options)
  }

  public async getPaymentById(userId: string, roles: string[], paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepo.findById(paymentId)
    if (!payment) throw new PaymentNotFoundException()

    const isAdmin = roles.includes(Roles.ADMIN) || roles.includes(Roles.SUPER_ADMIN)
    if (!isAdmin && payment.userId !== userId) {
      throw new PaymentAccessDeniedException()
    }

    return payment
  }
}
