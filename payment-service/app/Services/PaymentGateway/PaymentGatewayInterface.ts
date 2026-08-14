export interface GatewayPaymentRequest {
  paymentId: string
  orderId: string
  amount: number
  currency: string
  userId: string
}

export interface GatewayPaymentResponse {
  gatewayOrderId: string
  gatewayPaymentId?: string
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED'
  rawPayload?: any
}

export interface GatewayRefundRequest {
  paymentId: string
  gatewayPaymentId: string
  amount: number
  reason?: string
}

export interface GatewayRefundResponse {
  gatewayRefundId: string
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED'
  rawPayload?: any
}

export interface GatewayWebhookVerificationResult {
  isValid: boolean
  eventId: string
  eventType: string
  gatewayPaymentId?: string
  gatewayOrderId?: string
  status?: 'SUCCESS' | 'FAILED'
  rawPayload?: any
}

export interface PaymentGatewayInterface {
  createPayment(request: GatewayPaymentRequest): Promise<GatewayPaymentResponse>
  verifyPayment(gatewayPaymentId: string): Promise<GatewayPaymentResponse>
  verifyWebhook(headers: Record<string, any>, body: any): Promise<GatewayWebhookVerificationResult>
  createRefund(request: GatewayRefundRequest): Promise<GatewayRefundResponse>
}
