export class CustomException extends Error {
  public code: string
  public status: number

  constructor(message: string, code: string, status: number) {
    super(message)
    this.code = code
    this.status = status
  }
}

export class DeliveryNotFoundException extends CustomException {
  constructor(message = 'Delivery record not found') {
    super(message, 'E_DELIVERY_NOT_FOUND', 404)
  }
}

export class ActiveDeliveryNotFoundException extends CustomException {
  constructor(message = 'No active delivery found for this delivery partner') {
    super(message, 'E_ACTIVE_DELIVERY_NOT_FOUND', 404)
  }
}

export class DeliveryAccessDeniedException extends CustomException {
  constructor(message = 'Access denied to this delivery record') {
    super(message, 'E_DELIVERY_ACCESS_DENIED', 403)
  }
}

export class DeliveryInvalidStatusTransitionException extends CustomException {
  constructor(message = 'Invalid delivery status transition') {
    super(message, 'E_DELIVERY_INVALID_STATUS_TRANSITION', 409)
  }
}

export class DeliveryPartnerNotFoundException extends CustomException {
  constructor(message = 'Delivery partner profile not found') {
    super(message, 'E_DELIVERY_PARTNER_NOT_FOUND', 404)
  }
}

export class DeliveryPartnerAlreadyExistsException extends CustomException {
  constructor(message = 'Authenticated user is already registered as a delivery partner') {
    super(message, 'E_DELIVERY_PARTNER_ALREADY_EXISTS', 409)
  }
}

export class DeliveryPartnerAccessDeniedException extends CustomException {
  constructor(message = 'Access denied to delivery partner profile') {
    super(message, 'E_DELIVERY_PARTNER_ACCESS_DENIED', 403)
  }
}

export class DeliveryPartnerNotAvailableException extends CustomException {
  constructor(message = 'Delivery partner is not currently available') {
    super(message, 'E_DELIVERY_PARTNER_NOT_AVAILABLE', 400)
  }
}

export class DeliveryAlreadyAssignedException extends CustomException {
  constructor(message = 'Delivery is already assigned to a partner') {
    super(message, 'E_DELIVERY_ALREADY_ASSIGNED', 409)
  }
}

export class NoAvailableDeliveryPartnerException extends CustomException {
  constructor(message = 'No nearby available delivery partners found') {
    super(message, 'E_NO_AVAILABLE_DELIVERY_PARTNER', 404)
  }
}

export class DeliveryAssignmentFailedException extends CustomException {
  constructor(message = 'Failed to assign delivery partner') {
    super(message, 'E_DELIVERY_ASSIGNMENT_FAILED', 500)
  }
}

export class OrderNotFoundException extends CustomException {
  constructor(message = 'Order not found in Order Service') {
    super(message, 'E_ORDER_NOT_FOUND', 404)
  }
}

export class OrderNotReadyForDeliveryException extends CustomException {
  constructor(message = 'Order is not in an eligible status for delivery creation') {
    super(message, 'E_ORDER_NOT_READY_FOR_DELIVERY', 400)
  }
}

export class RestaurantNotFoundException extends CustomException {
  constructor(message = 'Restaurant not found in Restaurant Service') {
    super(message, 'E_RESTAURANT_NOT_FOUND', 404)
  }
}

export class RestaurantAddressNotFoundException extends CustomException {
  constructor(message = 'Restaurant pickup address or coordinates not found') {
    super(message, 'E_RESTAURANT_ADDRESS_NOT_FOUND', 404)
  }
}

export class UserNotFoundException extends CustomException {
  constructor(message = 'User not found in User Service') {
    super(message, 'E_USER_NOT_FOUND', 404)
  }
}

export class UserNotDeliveryPartnerException extends CustomException {
  constructor(message = 'User does not possess the DELIVERY_PARTNER role') {
    super(message, 'E_USER_NOT_DELIVERY_PARTNER', 403)
  }
}

export class UnauthorizedException extends CustomException {
  constructor(message = 'Unauthorized access') {
    super(message, 'E_UNAUTHORIZED', 401)
  }
}

export class ForbiddenException extends CustomException {
  constructor(message = 'Forbidden access') {
    super(message, 'E_FORBIDDEN', 403)
  }
}

export class BadRequestException extends CustomException {
  constructor(message = 'Bad request') {
    super(message, 'E_BAD_REQUEST', 400)
  }
}
