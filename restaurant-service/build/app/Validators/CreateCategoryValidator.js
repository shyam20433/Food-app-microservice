"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Validator_1 = global[Symbol.for('ioc.use')]("Adonis/Core/Validator");
const Status_1 = global[Symbol.for('ioc.use')]("App/Constants/Status");
class CreateCategoryValidator {
    constructor(ctx) {
        this.ctx = ctx;
        this.schema = Validator_1.schema.create({
            name: Validator_1.schema.string({ trim: true }, [Validator_1.rules.maxLength(255)]),
            description: Validator_1.schema.string.optional({ trim: true }, [Validator_1.rules.maxLength(1000)]),
            status: Validator_1.schema.enum.optional(Object.values(Status_1.CategoryStatus)),
        });
        this.messages = {
            'name.required': 'Category name is required',
        };
    }
}
exports.default = CreateCategoryValidator;
//# sourceMappingURL=CreateCategoryValidator.js.map