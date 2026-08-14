import { Exception } from '@adonisjs/core/build/standalone'

export class PaymentInvalidStatusTransitionException extends Exception {
  constructor(message = 'Invalid payment status transition') {
    super(message, 409, 'E_PAYMENT_INVALID_STATUS_TRANSITION')
  }
}

export class PaymentNotFoundException extends Exception {
  constructor(message = 'Payment not found') {
    super(message, 404, 'E_PAYMENT_NOT_FOUND')
  }
}

export class PaymentAccessDeniedException extends Exception {
  constructor(message = 'Access to this payment is denied') {
    super(message, 403, 'E_PAYMENT_ACCESS_DENIED')
  }
}

export class OrderNotPayableException extends Exception {
  constructor(message = 'Order is not in a payable status') {
    super(message, 400, 'E_ORDER_NOT_PAYABLE')
  }
}

export class OrderNotFoundException extends Exception {
  constructor(message = 'Order not found in Order Service') {
    super(message, 404, 'E_ORDER_NOT_FOUND')
  }
}

export class OrderAccessDeniedException extends Exception {
  constructor(message = 'Order does not belong to caller') {
    super(message, 403, 'E_ORDER_ACCESS_DENIED')
  }
}

export class InvalidRefundAmountException extends Exception {
  constructor(message = 'Refund amount exceeds remaining paid amount') {
    super(message, 400, 'E_INVALID_REFUND_AMOUNT')
  }
}

export class DuplicateWebhookException extends Exception {
  constructor(message = 'Webhook event already processed') {
    super(message, 409, 'E_DUPLICATE_WEBHOOK')
  }
}

export class UnauthorizedException extends Exception {
  constructor(message = 'Unauthorized access') {
    super(message, 401, 'E_UNAUTHORIZED')
  }
}

export class ForbiddenException extends Exception {
  constructor(message = 'Forbidden access') {
    super(message, 403, 'E_FORBIDDEN')
  }
}

export class BadRequestException extends Exception {
  constructor(message = 'Bad request') {
    super(message, 400, 'E_BAD_REQUEST')
  }
}
