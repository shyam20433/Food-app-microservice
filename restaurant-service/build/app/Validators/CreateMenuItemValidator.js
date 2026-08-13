"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Validator_1 = global[Symbol.for('ioc.use')]("Adonis/Core/Validator");
const Status_1 = global[Symbol.for('ioc.use')]("App/Constants/Status");
class CreateMenuItemValidator {
    constructor(ctx) {
        this.ctx = ctx;
        this.schema = Validator_1.schema.create({
            category_id: Validator_1.schema.string({ trim: true }, [Validator_1.rules.uuid()]),
            name: Validator_1.schema.string({ trim: true }, [Validator_1.rules.maxLength(255)]),
            description: Validator_1.schema.string.optional({ trim: true }, [Validator_1.rules.maxLength(1000)]),
            price: Validator_1.schema.number([Validator_1.rules.range(0.01, 100000)]),
            image: Validator_1.schema.string.optional({ trim: true }, [Validator_1.rules.maxLength(500)]),
            is_vegetarian: Validator_1.schema.boolean.optional(),
            preparation_time: Validator_1.schema.number.optional([Validator_1.rules.range(1, 1440)]),
            is_available: Validator_1.schema.boolean.optional(),
            status: Validator_1.schema.enum.optional(Object.values(Status_1.MenuItemStatus)),
        });
        this.messages = {
            'category_id.required': 'Category ID is required',
            'category_id.uuid': 'Category ID must be a valid UUID',
            'name.required': 'Menu item name is required',
            'price.required': 'Price is required',
            'price.range': 'Price must be greater than 0',
        };
    }
}
exports.default = CreateMenuItemValidator;
//# sourceMappingURL=CreateMenuItemValidator.js.map