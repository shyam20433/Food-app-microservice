import {
  PaymentGatewayInterface,
  GatewayPaymentRequest,
  GatewayPaymentResponse,
  GatewayRefundRequest,
  GatewayRefundResponse,
  GatewayWebhookVerificationResult,
} from 'App/Services/PaymentGateway/PaymentGatewayInterface'
import { v4 as uuidv4 } from 'uuid'

export class RazorpayGateway implements PaymentGatewayInterface {
  public async createPayment(request: GatewayPaymentRequest): Promise<GatewayPaymentResponse> {
    const rzpOrderId = `rzp_order_${uuidv4().replace(/-/g, '').slice(0, 12)}`
    return {
      gatewayOrderId: rzpOrderId,
      status: 'PENDING',
      rawPayload: { provider: 'RAZORPAY', amount: request.amount * 100 },
    }
  }

  public async verifyPayment(gatewayPaymentId: string): Promise<GatewayPaymentResponse> {
    return {
      gatewayOrderId: `rzp_order_ver`,
      gatewayPaymentId,
      status: 'SUCCESS',
    }
  }

  public async verifyWebhook(
    _headers: Record<string, any>,
    body: any
  ): Promise<GatewayWebhookVerificationResult> {
    return {
      isValid: true,
      eventId: body.event_id || `rzp_evt_${uuidv4()}`,
      eventType: body.event || 'payment.authorized',
      gatewayPaymentId: body.payload?.payment?.entity?.id,
      status: 'SUCCESS',
      rawPayload: body,
    }
  }

  public async createRefund(_request: GatewayRefundRequest): Promise<GatewayRefundResponse> {
    return {
      gatewayRefundId: `rzp_rfnd_${uuidv4().replace(/-/g, '').slice(0, 10)}`,
      status: 'SUCCESS',
    }
  }
}
