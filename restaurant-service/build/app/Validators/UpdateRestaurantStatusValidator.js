"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Validator_1 = global[Symbol.for('ioc.use')]("Adonis/Core/Validator");
const Status_1 = global[Symbol.for('ioc.use')]("App/Constants/Status");
class UpdateRestaurantStatusValidator {
    constructor(ctx) {
        this.ctx = ctx;
        this.schema = Validator_1.schema.create({
            status: Validator_1.schema.enum([Status_1.RestaurantStatus.ENABLED, Status_1.RestaurantStatus.DISABLED]),
        });
        this.messages = {
            'status.required': 'Status is required',
            'status.enum': 'Status must be either ENABLED or DISABLED. Soft deletion must be performed via DELETE /restaurants/:id',
        };
    }
}
exports.default = UpdateRestaurantStatusValidator;
//# sourceMappingURL=UpdateRestaurantStatusValidator.js.map