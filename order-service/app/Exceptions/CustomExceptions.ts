import { Exception } from '@adonisjs/core/build/standalone'

export class CartNotFoundException extends Exception {
  constructor(message = 'Active cart not found') {
    super(message, 404, 'E_CART_NOT_FOUND')
  }
}

export class CartEmptyException extends Exception {
  constructor(message = 'Cannot checkout an empty cart') {
    super(message, 400, 'E_CART_EMPTY')
  }
}

export class CartRestaurantMismatchException extends Exception {
  constructor(message = 'Your cart contains items from another restaurant. Please clear your cart to add items from this restaurant.') {
    super(message, 409, 'E_CART_RESTAURANT_MISMATCH')
  }
}

export class OrderNotFoundException extends Exception {
  constructor(message = 'Order not found') {
    super(message, 404, 'E_ORDER_NOT_FOUND')
  }
}

export class OrderAlreadyCancelledException extends Exception {
  constructor(message = 'Order has already been cancelled') {
    super(message, 409, 'E_ORDER_ALREADY_CANCELLED')
  }
}

export class OrderInvalidStatusTransitionException extends Exception {
  constructor(message = 'Invalid status transition for order') {
    super(message, 409, 'E_ORDER_INVALID_STATUS_TRANSITION')
  }
}

export class OrderCannotBeCancelledException extends Exception {
  constructor(message = 'Order cannot be cancelled in its current state') {
    super(message, 400, 'E_ORDER_CANNOT_BE_CANCELLED')
  }
}

export class RestaurantNotFoundException extends Exception {
  constructor(message = 'Restaurant not found') {
    super(message, 404, 'E_RESTAURANT_NOT_FOUND')
  }
}

export class MenuItemNotFoundException extends Exception {
  constructor(message = 'Menu item not found') {
    super(message, 404, 'E_MENU_ITEM_NOT_FOUND')
  }
}

export class MenuItemUnavailableException extends Exception {
  constructor(message = 'Menu item is currently unavailable') {
    super(message, 400, 'E_MENU_ITEM_UNAVAILABLE')
  }
}

export class MenuItemRestaurantMismatchException extends Exception {
  constructor(message = 'Menu item does not belong to the specified restaurant') {
    super(message, 409, 'E_MENU_ITEM_RESTAURANT_MISMATCH')
  }
}

export class OrderAccessDeniedException extends Exception {
  constructor(message = 'You do not have permission to access this order') {
    super(message, 403, 'E_ORDER_ACCESS_DENIED')
  }
}

export class RestaurantOrderAccessDeniedException extends Exception {
  constructor(message = 'You do not have permission to manage orders for this restaurant') {
    super(message, 403, 'E_RESTAURANT_ORDER_ACCESS_DENIED')
  }
}

export class UnauthorizedException extends Exception {
  constructor(message = 'Unauthorized access token') {
    super(message, 401, 'E_UNAUTHORIZED')
  }
}

export class BadRequestException extends Exception {
  constructor(message = 'Bad request') {
    super(message, 400, 'E_BAD_REQUEST')
  }
}
