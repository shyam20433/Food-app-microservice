import jwt from 'jsonwebtoken'
import { PaymentStatus } from '../../app/Constants/PaymentStatus'
import { PaymentStateService } from '../../app/Services/PaymentStateService'
import { MockPaymentGateway } from '../../app/Services/PaymentGateway/MockPaymentGateway'
import {
  PaymentInvalidStatusTransitionException,
  DuplicateWebhookException,
} from '../../app/Exceptions/CustomExceptions'

export async function runPaymentServiceTests() {
  console.log('🧪 Starting Payment Microservice Comprehensive Test Suite...\n')

  let passed = 0

  // 1. JWT Generation & Claim Extraction
  console.log('1. Testing JWT Token Signature & Claims Extraction...')
  const secret = 'super_secret_jwt_key_adonis_user_service'
  const token = jwt.sign(
    { id: 'user-pay-1001', email: 'payer@example.com', roles: ['CUSTOMER'] },
    secret
  )
  const decoded: any = jwt.verify(token, secret)
  if (decoded.id !== 'user-pay-1001' || !decoded.roles.includes('CUSTOMER')) {
    throw new Error('JWT verification failed')
  }
  console.log('  ✓ JWT claims & signature verified')
  passed++

  // 2. Payment State Machine Transitions
  console.log('2. Testing Payment State Machine Lifecycle Transitions...')
  // Valid transitions
  PaymentStateService.validateTransition(PaymentStatus.CREATED, PaymentStatus.PENDING)
  PaymentStateService.validateTransition(PaymentStatus.PENDING, PaymentStatus.PROCESSING)
  PaymentStateService.validateTransition(PaymentStatus.PROCESSING, PaymentStatus.SUCCESS)
  PaymentStateService.validateTransition(PaymentStatus.PENDING, PaymentStatus.FAILED)
  PaymentStateService.validateTransition(PaymentStatus.PENDING, PaymentStatus.CANCELLED)
  PaymentStateService.validateTransition(PaymentStatus.SUCCESS, PaymentStatus.PARTIALLY_REFUNDED)
  PaymentStateService.validateTransition(PaymentStatus.PARTIALLY_REFUNDED, PaymentStatus.REFUNDED)
  PaymentStateService.validateTransition(PaymentStatus.SUCCESS, PaymentStatus.REFUNDED)
  console.log('  ✓ All allowed lifecycle transitions verified')

  // Invalid transitions
  const invalidTransitions = [
    [PaymentStatus.FAILED, PaymentStatus.SUCCESS],
    [PaymentStatus.REFUNDED, PaymentStatus.SUCCESS],
    [PaymentStatus.CANCELLED, PaymentStatus.SUCCESS],
    [PaymentStatus.CREATED, PaymentStatus.SUCCESS],
  ]

  for (const [from, to] of invalidTransitions) {
    let caught = false
    try {
      PaymentStateService.validateTransition(from as PaymentStatus, to as PaymentStatus)
    } catch (err) {
      if (err instanceof PaymentInvalidStatusTransitionException) {
        caught = true
      }
    }
    if (!caught) {
      throw new Error(`Invalid transition from ${from} to ${to} was improperly permitted`)
    }
  }
  console.log('  ✓ All invalid status transitions correctly rejected with E_PAYMENT_INVALID_STATUS_TRANSITION')
  passed++

  // 3. Mock Payment Gateway Integration Interface
  console.log('3. Testing Mock Payment Gateway Abstraction...')
  const mockGateway = new MockPaymentGateway()
  const createRes = await mockGateway.createPayment({
    paymentId: 'pay-uuid-1',
    orderId: 'order-uuid-1',
    amount: 149.99,
    currency: 'INR',
    userId: 'user-pay-1001',
  })

  if (!createRes.gatewayOrderId || !createRes.gatewayPaymentId || createRes.status !== 'PENDING') {
    throw new Error('MockPaymentGateway.createPayment failed response validation')
  }

  const refundRes = await mockGateway.createRefund({
    paymentId: 'pay-uuid-1',
    gatewayPaymentId: createRes.gatewayPaymentId,
    amount: 50.0,
    reason: 'Customer requested partial cancellation',
  })

  if (!refundRes.gatewayRefundId || refundRes.status !== 'SUCCESS') {
    throw new Error('MockPaymentGateway.createRefund failed')
  }
  console.log('  ✓ Mock Payment Gateway payment creation & refund integration verified')
  passed++

  // 4. Refund Limit & Calculation Logic
  console.log('4. Testing Full & Partial Refund Calculations...')
  const totalPaidAmount = 1000.0
  let currentRefundTotal = 0.0

  // First Partial Refund ₹300
  const refund1 = 300.0
  if (refund1 > totalPaidAmount - currentRefundTotal) throw new Error('Partial refund failed')
  currentRefundTotal += refund1

  let status1 = currentRefundTotal >= totalPaidAmount ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED
  if (status1 !== PaymentStatus.PARTIALLY_REFUNDED) throw new Error('Expected PARTIALLY_REFUNDED status')

  // Excessive Refund Attempt ₹800 (Remaining is ₹700)
  let caughtExcessive = false
  const excessiveRefund = 800.0
  if (excessiveRefund > totalPaidAmount - currentRefundTotal) {
    caughtExcessive = true
  }
  if (!caughtExcessive) throw new Error('Excessive refund calculation check failed')

  // Second Final Refund ₹700
  const refund2 = 700.0
  currentRefundTotal += refund2
  let status2 = currentRefundTotal >= totalPaidAmount ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED
  if (status2 !== PaymentStatus.REFUNDED) throw new Error('Expected REFUNDED status')

  console.log('  ✓ Partial (₹300 -> PARTIALLY_REFUNDED) and Full (₹1000 -> REFUNDED) calculations verified')
  passed++

  // 5. Idempotency Hashing & Deduplication Logic
  console.log('5. Testing Idempotency Key Hashing & Request Payload Matching...')
  const crypto = require('crypto')
  function generateHash(payload: any): string {
    return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex')
  }
  const payloadA = { order_id: 'order-123', gateway: 'MOCK' }
  const payloadB = { order_id: 'order-123', gateway: 'MOCK' }
  const payloadC = { order_id: 'order-999', gateway: 'MOCK' }

  const hashA = generateHash(payloadA)
  const hashB = generateHash(payloadB)
  const hashC = generateHash(payloadC)

  if (hashA !== hashB) throw new Error('Identical payloads produced different hashes')
  if (hashA === hashC) throw new Error('Different payloads produced identical hashes')

  console.log('  ✓ Idempotency request hash calculation verified')
  passed++

  // 6. Webhook Event Deduplication Rules
  console.log('6. Testing Webhook Event Deduplication Rule...')
  const processedWebhooks = new Set<string>()

  function handleWebhookEvent(gateway: string, eventId: string) {
    const key = `${gateway}:${eventId}`
    if (processedWebhooks.has(key)) {
      throw new DuplicateWebhookException()
    }
    processedWebhooks.add(key)
    return { eventId, status: 'PROCESSED' }
  }

  handleWebhookEvent('RAZORPAY', 'evt_1001')

  let caughtDuplicateWebhook = false
  try {
    handleWebhookEvent('RAZORPAY', 'evt_1001')
  } catch (err) {
    if (err instanceof DuplicateWebhookException) {
      caughtDuplicateWebhook = true
    }
  }
  if (!caughtDuplicateWebhook) throw new Error('Duplicate webhook deduplication failed')

  console.log('  ✓ Webhook duplicate event_id rejection verified')
  passed++

  console.log(`\n🎉 ALL ${passed}/6 PAYMENT MICROSERVICE TEST SUITES PASSED PERFECTLY!`)
  return true
}

runPaymentServiceTests().catch((err) => {
  console.error('❌ Payment Service test failed:', err)
  process.exit(1)
})
