import Database from '@ioc:Adonis/Lucid/Database'
import { PaymentRepository } from 'App/Repositories/PaymentRepository'
import { PaymentAttemptRepository } from 'App/Repositories/PaymentAttemptRepository'
import { RefundRepository } from 'App/Repositories/RefundRepository'
import { WebhookEventRepository } from 'App/Repositories/WebhookEventRepository'
import { OrderClient } from 'App/Services/OrderClient'
import { PaymentGatewayFactory } from 'App/Services/PaymentGateway/PaymentGatewayFactory'
import { PaymentStateService } from 'App/Services/PaymentStateService'
import Payment from 'App/Models/Payment'
import PaymentAttempt from 'App/Models/PaymentAttempt'
import { publishEvent } from 'App/Services/RabbitMQService'
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

    // 3. Check existing payment for this order
    const existing = await this.paymentRepo.findByOrderId(orderId)
    if (existing && existing.status === PaymentStatus.SUCCESS) {
      return existing
    }

    const selectedGateway = (gatewayName || PaymentGateway.MOCK) as PaymentGateway

    // 4. Create or reuse Payment record inside transaction
    const trx = await Database.transaction()

    try {
      let payment = existing
      if (!payment) {
        payment = await this.paymentRepo.create(
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
      } else {
        payment.useTransaction(trx)
      }

      // 5. Create initial Payment Attempt
      const attempt = await this.attemptRepo.create(
        {
          paymentId: payment.id,
          attemptNumber: (payment.attempts?.length || 0) + 1,
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
      const finalStatus = gatewayRes.status === 'SUCCESS' ? PaymentStatus.SUCCESS : PaymentStatus.PENDING
      const attemptFinalStatus = gatewayRes.status === 'SUCCESS' ? PaymentAttemptStatus.SUCCESS : PaymentAttemptStatus.PENDING

      await this.attemptRepo.updateStatus(
        attempt.id,
        attemptFinalStatus,
        {
          gatewayOrderId: gatewayRes.gatewayOrderId,
          gatewayPaymentId: gatewayRes.gatewayPaymentId,
        },
        { client: trx }
      )

      await this.paymentRepo.updateStatus(
        payment.id,
        finalStatus,
        gatewayRes.gatewayPaymentId,
        { client: trx }
      )

      await trx.commit()

      const result = await this.paymentRepo.findById(payment.id)

      if (finalStatus === PaymentStatus.SUCCESS) {
        const targetOrderId = result!.orderId || (result as any).order_id
        publishEvent('payment.succeeded', {
          payment_id: result!.id,
          order_id: targetOrderId,
          orderId: targetOrderId,
          amount: result!.amount,
          transaction_id: result!.gatewayPaymentId,
        })
      }

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

      if (targetStatus === PaymentStatus.SUCCESS) {
        publishEvent('payment.succeeded', {
          payment_id: updated!.id,
          order_id: updated!.orderId,
          amount: updated!.amount,
          transaction_id: updated!.gatewayPaymentId,
        })
      } else {
        publishEvent('payment.failed', {
          payment_id: updated!.id,
          order_id: updated!.orderId,
          reason: 'Mock payment failed',
        })
      }

      return updated!
    } catch (err) {
      await trx.rollback()
      throw err
    }
  }

  public async handleOrderCreated(event: { order_id: string; user_id: string; total_amount: number }) {
    const existing = await this.paymentRepo.findByOrderId(event.order_id)
    if (existing) return

    try {
      await this.paymentRepo.create({
        orderId: event.order_id,
        userId: event.user_id,
        amount: event.total_amount,
        currency: 'INR',
        status: PaymentStatus.PENDING,
        gateway: PaymentGateway.MOCK,
      })
      console.log(`[PaymentService] Auto-created pending payment for order ${event.order_id}`)
    } catch (err) {
      console.error(`[PaymentService] Failed auto-creating payment for order ${event.order_id}:`, err)
    }
  }

  public async handleOrderCancellationRequested(event: {
    order_id: string
    user_id?: string
    previous_order_status?: string
    reason?: string
  }) {
    console.log(`[PaymentSaga] Received order.cancellation_requested for order ${event.order_id}`)

    const payment = await this.paymentRepo.findByOrderId(event.order_id)

    // No payment or payment not in a refundable state — saga still completes (no money to return)
    if (!payment) {
      console.log(`[PaymentSaga] No payment found for order ${event.order_id}. Completing saga with no refund.`)
      await publishEvent('payment.refund_processed', {
        order_id: event.order_id,
        refund_id: null,
        amount: 0,
        previous_order_status: event.previous_order_status,
      })
      return
    }

    const refundableStatuses = [PaymentStatus.SUCCESS, PaymentStatus.PARTIALLY_REFUNDED]
    if (!refundableStatuses.includes(payment.status)) {
      console.log(`[PaymentSaga] Payment ${payment.id} is '${payment.status}' — no refund needed. Completing saga.`)
      await publishEvent('payment.refund_processed', {
        order_id: event.order_id,
        refund_id: null,
        amount: 0,
        previous_order_status: event.previous_order_status,
      })
      return
    }

    try {
      const previousRefundsTotal = await this.refundRepo.getSuccessfulRefundsTotal(payment.id)
      const remainingAmount = Math.round((Number(payment.amount) - previousRefundsTotal) * 100) / 100

      if (remainingAmount <= 0) {
        console.log(`[PaymentSaga] Payment ${payment.id} already fully refunded. Completing saga.`)
        await publishEvent('payment.refund_processed', {
          order_id: event.order_id,
          refund_id: null,
          amount: 0,
          previous_order_status: event.previous_order_status,
        })
        return
      }

      const refund = await this.requestRefund(
        payment.userId,
        [Roles.ADMIN],
        payment.id,
        remainingAmount,
        event.reason || 'Order cancelled by restaurant'
      )

      console.log(`[PaymentSaga] ✅ Auto-refund ₹${remainingAmount} processed for order ${event.order_id}. Publishing payment.refund_processed.`)
      await publishEvent('payment.refund_processed', {
        order_id: event.order_id,
        refund_id: refund.id,
        amount: remainingAmount,
        previous_order_status: event.previous_order_status,
      })
    } catch (err) {
      console.error(`[PaymentSaga] ❌ Refund failed for order ${event.order_id}:`, err)
      await publishEvent('payment.refund_failed', {
        order_id: event.order_id,
        reason: (err as Error).message || 'Refund gateway error',
        previous_order_status: event.previous_order_status,
      })
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
      let payment: Payment | null = null

      if (verification.gatewayPaymentId) {
        payment = await Payment.findBy('gateway_payment_id', verification.gatewayPaymentId)
      }

      if (!payment && verification.gatewayOrderId) {
        const attempt = await PaymentAttempt.findBy('gateway_order_id', verification.gatewayOrderId)
        if (attempt) {
          payment = await Payment.find(attempt.paymentId)
        }
      }

      if (!payment && verification.rawPayload) {
        const orderIdNotes = verification.rawPayload?.payload?.payment?.entity?.notes?.order_id
        if (orderIdNotes) {
          payment = await this.paymentRepo.findByOrderId(orderIdNotes)
        }
      }

      if (payment) {
        const targetStatus =
          verification.status === 'SUCCESS' ? PaymentStatus.SUCCESS : PaymentStatus.FAILED
        PaymentStateService.validateTransition(payment.status, targetStatus)
        await this.paymentRepo.updateStatus(payment.id, targetStatus, verification.gatewayPaymentId)

        const latestAttempt = await PaymentAttempt.query()
          .where('payment_id', payment.id)
          .orderBy('attempt_number', 'desc')
          .first()

        if (latestAttempt) {
          const attemptStatus =
            verification.status === 'SUCCESS' ? PaymentAttemptStatus.SUCCESS : PaymentAttemptStatus.FAILED
          await this.attemptRepo.updateStatus(latestAttempt.id, attemptStatus, {
            gatewayPaymentId: verification.gatewayPaymentId,
            gatewayOrderId: verification.gatewayOrderId,
          })
        }

        if (targetStatus === PaymentStatus.SUCCESS) {
          const targetOrderId = payment.orderId || (payment as any).order_id
          await publishEvent('payment.succeeded', {
            payment_id: payment.id,
            orderId: targetOrderId,
            amount: payment.amount,
            transaction_id: verification.gatewayPaymentId || payment.gatewayPaymentId,
          })
          console.log(`[PaymentService] Webhook: Published payment.succeeded for order ${targetOrderId}`)
        } else {
          const targetOrderId = payment.orderId || (payment as any).order_id
          await publishEvent('payment.failed', {
            payment_id: payment.id,
            order_id: targetOrderId,
            orderId: targetOrderId,
            reason: 'Webhook reported payment failure',
          })
        }
      }

      await this.webhookRepo.markProcessed(eventRecord.id, 'PROCESSED')
      return { eventId: verification.eventId, processed: true }
    } catch (err) {
      await this.webhookRepo.markProcessed(eventRecord.id, 'FAILED')
      throw err
    }
  }

  public async getAllPayments(
    options?: { page?: number; limit?: number }
  ): Promise<{ data: Payment[]; meta: any }> {
    return await this.paymentRepo.findAll(options)
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
