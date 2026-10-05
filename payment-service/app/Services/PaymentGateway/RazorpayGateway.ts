import Razorpay from 'razorpay'
import crypto from 'crypto'
import Env from '@ioc:Adonis/Core/Env'
import {
  PaymentGatewayInterface,
  GatewayPaymentRequest,
  GatewayPaymentResponse,
  GatewayRefundRequest,
  GatewayRefundResponse,
  GatewayWebhookVerificationResult,
} from 'App/Services/PaymentGateway/PaymentGatewayInterface'

export class RazorpayGateway implements PaymentGatewayInterface {
  private rzp: Razorpay

  constructor() {
    this.rzp = new Razorpay({
      key_id:     Env.get('RAZORPAY_KEY_ID'),
      key_secret: Env.get('RAZORPAY_KEY_SECRET'),
    })
  }

  // ── Step 1: Create a Razorpay order (returns PENDING — user hasn't paid yet) ──
  public async createPayment(request: GatewayPaymentRequest): Promise<GatewayPaymentResponse> {
    const amountInPaise = Math.max(100, Math.round(request.amount * 100))
    const order = await this.rzp.orders.create({
      amount:   amountInPaise,  // convert ₹ to paise (Razorpay requires min 100 paise)
      currency: request.currency || 'INR',
      receipt:  request.paymentId.slice(0, 40),     // Razorpay receipt max 40 chars
      notes: {
        order_id: request.orderId,
        user_id:  request.userId,
      },
    })

    return {
      gatewayOrderId:   order.id,      // e.g. "order_Pxxx" — send this to frontend
      gatewayPaymentId: undefined,     // not available yet (user hasn't paid)
      status:           'PENDING',     // waiting for user to complete payment
      rawPayload:       order,
    }
  }

  // ── Step 2: Verify payment after Razorpay confirms it ─────────────────────────
  public async verifyPayment(gatewayPaymentId: string): Promise<GatewayPaymentResponse> {
    const payment = await this.rzp.payments.fetch(gatewayPaymentId)

    return {
      gatewayOrderId:   payment.order_id as string,
      gatewayPaymentId: payment.id,
      status:           payment.status === 'captured' ? 'SUCCESS' : 'FAILED',
      rawPayload:       payment,
    }
  }

  // ── Step 3: Verify incoming webhook is genuinely from Razorpay ────────────────
  public async verifyWebhook(
    headers: Record<string, any>,
    body: any
  ): Promise<GatewayWebhookVerificationResult> {
    const webhookSecret    = Env.get('RAZORPAY_WEBHOOK_SECRET')
    const receivedSig      = headers['x-razorpay-signature'] as string
    const bodyString       = typeof body === 'string' ? body : JSON.stringify(body)

    // HMAC-SHA256 verification — proves the request came from Razorpay
    const expectedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(bodyString)
      .digest('hex')

    const isValid = receivedSig === expectedSig

    const entity        = body?.payload?.payment?.entity || {}
    const eventId       = entity.id || `evt_${Date.now()}`
    const eventType     = body?.event || 'unknown'
    const paymentStatus = entity.status === 'captured' ? 'SUCCESS' : 'FAILED'

    return {
      isValid,
      eventId,
      eventType,
      gatewayPaymentId: entity.id,
      gatewayOrderId:   entity.order_id,
      status:           paymentStatus,
      rawPayload:       body,
    }
  }

  // ── Refund ────────────────────────────────────────────────────────────────────
  public async createRefund(request: GatewayRefundRequest): Promise<GatewayRefundResponse> {
    const refund = await this.rzp.payments.refund(request.gatewayPaymentId, {
      amount: Math.round(request.amount * 100),  // paise
      notes: { reason: request.reason || 'Customer request' },
    })

    return {
      gatewayRefundId: refund.id,
      status:          refund.status === 'processed' ? 'SUCCESS' : 'PENDING',
      rawPayload:      refund,
    }
  }
}
