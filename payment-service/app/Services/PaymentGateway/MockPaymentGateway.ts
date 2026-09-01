import {
  PaymentGatewayInterface,
  GatewayPaymentRequest,
  GatewayPaymentResponse,
  GatewayRefundRequest,
  GatewayRefundResponse,
  GatewayWebhookVerificationResult,
} from 'App/Services/PaymentGateway/PaymentGatewayInterface'
import { v4 as uuidv4 } from 'uuid'

export class MockPaymentGateway implements PaymentGatewayInterface {
  public async createPayment(request: GatewayPaymentRequest): Promise<GatewayPaymentResponse> {
    const mockGatewayOrderId = `mock_order_${uuidv4().replace(/-/g, '').slice(0, 12)}`
    const mockGatewayPaymentId = `mock_pay_${uuidv4().replace(/-/g, '').slice(0, 12)}`

    return {
      gatewayOrderId: mockGatewayOrderId,
      gatewayPaymentId: mockGatewayPaymentId,
      status: 'SUCCESS',
      rawPayload: {
        gateway: 'MOCK',
        amount: request.amount,
        currency: request.currency,
        created_at: new Date().toISOString(),
      },
    }
  }

  public async verifyPayment(gatewayPaymentId: string): Promise<GatewayPaymentResponse> {
    return {
      gatewayOrderId: `mock_order_${gatewayPaymentId}`,
      gatewayPaymentId,
      status: 'SUCCESS',
      rawPayload: { verified: true },
    }
  }

  public async verifyWebhook(
    _headers: Record<string, any>,
    body: any
  ): Promise<GatewayWebhookVerificationResult> {
    const eventId = body.event_id || body.id || `evt_${uuidv4().replace(/-/g, '').slice(0, 10)}`
    const eventType = body.event_type || body.event || 'payment.captured'

    return {
      isValid: true,
      eventId,
      eventType,
      gatewayPaymentId: body.gateway_payment_id || body.payload?.payment?.entity?.id || 'mock_pay_123',
      gatewayOrderId: body.gateway_order_id || body.payload?.order?.entity?.id || 'mock_order_123',
      status: body.status === 'failed' ? 'FAILED' : 'SUCCESS',
      rawPayload: body,
    }
  }

  public async createRefund(request: GatewayRefundRequest): Promise<GatewayRefundResponse> {
    const mockGatewayRefundId = `mock_rfnd_${uuidv4().replace(/-/g, '').slice(0, 12)}`

    return {
      gatewayRefundId: mockGatewayRefundId,
      status: 'SUCCESS',
      rawPayload: {
        refunded_amount: request.amount,
        reason: request.reason || 'Customer request',
      },
    }
  }
}
