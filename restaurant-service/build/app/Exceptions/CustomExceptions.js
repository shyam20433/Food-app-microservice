"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerErrorException = exports.ValidationException = exports.AddressAlreadyExistsException = exports.CategoryAlreadyExistsException = exports.RestaurantAlreadyExistsException = exports.ConflictException = exports.AddressNotFoundException = exports.MenuItemNotFoundException = exports.CategoryNotFoundException = exports.RestaurantNotFoundException = exports.NotFoundException = exports.RestaurantAccessDeniedException = exports.ForbiddenException = exports.UnauthorizedException = exports.MenuItemNotBelongToRestaurantException = exports.CategoryNotBelongToRestaurantException = exports.BadRequestException = void 0;
const utils_1 = require("@poppinss/utils");
class BadRequestException extends utils_1.Exception {
    constructor(message = 'Bad request', code = 'E_BAD_REQUEST') {
        super(message, 400, code);
    }
}
exports.BadRequestException = BadRequestException;
class CategoryNotBelongToRestaurantException extends utils_1.Exception {
    constructor(message = 'Category does not belong to the specified restaurant') {
        super(message, 400, 'E_CATEGORY_NOT_BELONG_TO_RESTAURANT');
    }
}
exports.CategoryNotBelongToRestaurantException = CategoryNotBelongToRestaurantException;
class MenuItemNotBelongToRestaurantException extends utils_1.Exception {
    constructor(message = 'Menu item does not belong to the specified restaurant') {
        super(message, 400, 'E_MENU_ITEM_NOT_BELONG_TO_RESTAURANT');
    }
}
exports.MenuItemNotBelongToRestaurantException = MenuItemNotBelongToRestaurantException;
class UnauthorizedException extends utils_1.Exception {
    constructor(message = 'Unauthorized access', code = 'E_UNAUTHORIZED_ACCESS') {
        super(message, 401, code);
    }
}
exports.UnauthorizedException = UnauthorizedException;
class ForbiddenException extends utils_1.Exception {
    constructor(message = 'Access forbidden', code = 'E_FORBIDDEN_ACCESS') {
        super(message, 403, code);
    }
}
exports.ForbiddenException = ForbiddenException;
class RestaurantAccessDeniedException extends utils_1.Exception {
    constructor(message = 'You do not have permission to modify or manage this restaurant') {
        super(message, 403, 'E_RESTAURANT_ACCESS_DENIED');
    }
}
exports.RestaurantAccessDeniedException = RestaurantAccessDeniedException;
class NotFoundException extends utils_1.Exception {
    constructor(message = 'Resource not found', code = 'E_NOT_FOUND') {
        super(message, 404, code);
    }
}
exports.NotFoundException = NotFoundException;
class RestaurantNotFoundException extends utils_1.Exception {
    constructor(message = 'Restaurant not found') {
        super(message, 404, 'E_RESTAURANT_NOT_FOUND');
    }
}
exports.RestaurantNotFoundException = RestaurantNotFoundException;
class CategoryNotFoundException extends utils_1.Exception {
    constructor(message = 'Category not found') {
        super(message, 404, 'E_CATEGORY_NOT_FOUND');
    }
}
exports.CategoryNotFoundException = CategoryNotFoundException;
class MenuItemNotFoundException extends utils_1.Exception {
    constructor(message = 'Menu item not found') {
        super(message, 404, 'E_MENU_ITEM_NOT_FOUND');
    }
}
exports.MenuItemNotFoundException = MenuItemNotFoundException;
class AddressNotFoundException extends utils_1.Exception {
    constructor(message = 'Restaurant address not found') {
        super(message, 404, 'E_ADDRESS_NOT_FOUND');
    }
}
exports.AddressNotFoundException = AddressNotFoundException;
class ConflictException extends utils_1.Exception {
    constructor(message = 'Resource conflict', code = 'E_RESOURCE_CONFLICT') {
        super(message, 409, code);
    }
}
exports.ConflictException = ConflictException;
class RestaurantAlreadyExistsException extends utils_1.Exception {
    constructor(message = 'Restaurant already exists with this name or email') {
        super(message, 409, 'E_RESTAURANT_ALREADY_EXISTS');
    }
}
exports.RestaurantAlreadyExistsException = RestaurantAlreadyExistsException;
class CategoryAlreadyExistsException extends utils_1.Exception {
    constructor(message = 'Category already exists for this restaurant') {
        super(message, 409, 'E_CATEGORY_ALREADY_EXISTS');
    }
}
exports.CategoryAlreadyExistsException = CategoryAlreadyExistsException;
class AddressAlreadyExistsException extends utils_1.Exception {
    constructor(message = 'A primary address already exists for this restaurant. Use PUT to update.') {
        super(message, 409, 'E_RESTAURANT_ADDRESS_ALREADY_EXISTS');
    }
}
exports.AddressAlreadyExistsException = AddressAlreadyExistsException;
class ValidationException extends utils_1.Exception {
    constructor(message = 'Validation failed', code = 'E_VALIDATION_FAILURE') {
        super(message, 422, code);
    }
}
exports.ValidationException = ValidationException;
class InternalServerErrorException extends utils_1.Exception {
    constructor(message = 'Internal server error occurred', code = 'E_INTERNAL_SERVER_ERROR') {
        super(message, 500, code);
    }
}
exports.InternalServerErrorException = InternalServerErrorException;
//# sourceMappingURL=CustomExceptions.js.map