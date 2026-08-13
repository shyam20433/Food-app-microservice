"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Validator_1 = global[Symbol.for('ioc.use')]("Adonis/Core/Validator");
class UpdateAvailabilityValidator {
    constructor(ctx) {
        this.ctx = ctx;
        this.schema = Validator_1.schema.create({
            is_available: Validator_1.schema.boolean(),
        });
        this.messages = {
            'is_available.required': 'is_available boolean field is required',
            'is_available.boolean': 'is_available must be a boolean value',
        };
    }
}
exports.default = UpdateAvailabilityValidator;
//# sourceMappingURL=UpdateAvailabilityValidator.js.map