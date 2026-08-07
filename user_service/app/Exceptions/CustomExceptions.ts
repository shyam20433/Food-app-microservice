import { Exception } from '@poppinss/utils'

/**
 * 400 Bad Request Exceptions
 */
export class BadRequestException extends Exception {
  constructor(message = 'Bad request', code = 'E_BAD_REQUEST') {
    super(message, 400, code)
  }
}

export class AddressLimitExceededException extends Exception {
  constructor(message = 'User already has an active address. Maximum allowed is 1.') {
    super(message, 400, 'E_ADDRESS_LIMIT_EXCEEDED')
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

export class InvalidCredentialsException extends Exception {
  constructor(message = 'Invalid email or password') {
    super(message, 401, 'E_INVALID_CREDENTIALS')
  }
}

export class RefreshTokenInvalidException extends Exception {
  constructor(message = 'Refresh token is invalid or revoked') {
    super(message, 401, 'E_REFRESH_TOKEN_INVALID')
  }
}

export class RefreshTokenExpiredException extends Exception {
  constructor(message = 'Refresh token has expired') {
    super(message, 401, 'E_REFRESH_TOKEN_EXPIRED')
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

export class UserInactiveException extends Exception {
  constructor(message = 'User account is inactive or disabled') {
    super(message, 403, 'E_USER_INACTIVE')
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

export class UserNotFoundException extends Exception {
  constructor(message = 'User not found') {
    super(message, 404, 'E_USER_NOT_FOUND')
  }
}

export class RoleNotFoundException extends Exception {
  constructor(message = 'Role not found') {
    super(message, 404, 'E_ROLE_NOT_FOUND')
  }
}

export class AddressNotFoundException extends Exception {
  constructor(message = 'Address not found') {
    super(message, 404, 'E_ADDRESS_NOT_FOUND')
  }
}

export class RoleAssignmentNotFoundException extends Exception {
  constructor(message = 'Role assignment not found for user') {
    super(message, 404, 'E_ROLE_ASSIGNMENT_NOT_FOUND')
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

export class UserAlreadyExistsException extends Exception {
  constructor(message = 'User already exists with this email or phone number') {
    super(message, 409, 'E_USER_ALREADY_EXISTS')
  }
}

export class RoleAlreadyExistsException extends Exception {
  constructor(message = 'Role already exists with this name') {
    super(message, 409, 'E_ROLE_ALREADY_EXISTS')
  }
}

export class RoleAssignmentAlreadyExistsException extends Exception {
  constructor(message = 'Role is already assigned to this user') {
    super(message, 409, 'E_ROLE_ASSIGNMENT_ALREADY_EXISTS')
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
