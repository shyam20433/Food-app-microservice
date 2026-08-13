import { Exception } from '@poppinss/utils'

/**
 * 400 Bad Request Exceptions
 */
export class BadRequestException extends Exception {
  constructor(message = 'Bad request', code = 'E_BAD_REQUEST') {
    super(message, 400, code)
  }
}

export class CategoryNotBelongToRestaurantException extends Exception {
  constructor(message = 'Category does not belong to the specified restaurant') {
    super(message, 400, 'E_CATEGORY_NOT_BELONG_TO_RESTAURANT')
  }
}

export class MenuItemNotBelongToRestaurantException extends Exception {
  constructor(message = 'Menu item does not belong to the specified restaurant') {
    super(message, 400, 'E_MENU_ITEM_NOT_BELONG_TO_RESTAURANT')
  }
}

/**
 * 401 Unauthorized Exceptions
 */
export class UnauthorizedException extends Exception {
  constructor(message = 'Unauthorized access', code = 'E_UNAUTHORIZED_ACCESS') {
    super(message, 401, code)
  }
}

/**
 * 403 Forbidden Exceptions
 */
export class ForbiddenException extends Exception {
  constructor(message = 'Access forbidden', code = 'E_FORBIDDEN_ACCESS') {
    super(message, 403, code)
  }
}

export class RestaurantAccessDeniedException extends Exception {
  constructor(message = 'You do not have permission to modify or manage this restaurant') {
    super(message, 403, 'E_RESTAURANT_ACCESS_DENIED')
  }
}

/**
 * 404 Not Found Exceptions
 */
export class NotFoundException extends Exception {
  constructor(message = 'Resource not found', code = 'E_NOT_FOUND') {
    super(message, 404, code)
  }
}

export class RestaurantNotFoundException extends Exception {
  constructor(message = 'Restaurant not found') {
    super(message, 404, 'E_RESTAURANT_NOT_FOUND')
  }
}

export class CategoryNotFoundException extends Exception {
  constructor(message = 'Category not found') {
    super(message, 404, 'E_CATEGORY_NOT_FOUND')
  }
}

export class MenuItemNotFoundException extends Exception {
  constructor(message = 'Menu item not found') {
    super(message, 404, 'E_MENU_ITEM_NOT_FOUND')
  }
}

export class AddressNotFoundException extends Exception {
  constructor(message = 'Restaurant address not found') {
    super(message, 404, 'E_ADDRESS_NOT_FOUND')
  }
}

/**
 * 409 Conflict Exceptions
 */
export class ConflictException extends Exception {
  constructor(message = 'Resource conflict', code = 'E_RESOURCE_CONFLICT') {
    super(message, 409, code)
  }
}

export class RestaurantAlreadyExistsException extends Exception {
  constructor(message = 'Restaurant already exists with this name or email') {
    super(message, 409, 'E_RESTAURANT_ALREADY_EXISTS')
  }
}

export class CategoryAlreadyExistsException extends Exception {
  constructor(message = 'Category already exists for this restaurant') {
    super(message, 409, 'E_CATEGORY_ALREADY_EXISTS')
  }
}

export class AddressAlreadyExistsException extends Exception {
  constructor(message = 'A primary address already exists for this restaurant. Use PUT to update.') {
    super(message, 409, 'E_RESTAURANT_ADDRESS_ALREADY_EXISTS')
  }
}

/**
 * 422 Unprocessable Entity / Validation Exceptions
 */
export class ValidationException extends Exception {
  constructor(message = 'Validation failed', code = 'E_VALIDATION_FAILURE') {
    super(message, 422, code)
  }
}

/**
 * 500 Internal Server Error Exceptions
 */
export class InternalServerErrorException extends Exception {
  constructor(message = 'Internal server error occurred', code = 'E_INTERNAL_SERVER_ERROR') {
    super(message, 500, code)
  }
}
