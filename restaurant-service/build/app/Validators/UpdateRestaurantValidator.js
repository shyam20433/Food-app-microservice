"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Validator_1 = global[Symbol.for('ioc.use')]("Adonis/Core/Validator");
const Status_1 = global[Symbol.for('ioc.use')]("App/Constants/Status");
class UpdateRestaurantValidator {
    constructor(ctx) {
        this.ctx = ctx;
        this.schema = Validator_1.schema.create({
            name: Validator_1.schema.string.optional({ trim: true }, [Validator_1.rules.maxLength(255)]),
            description: Validator_1.schema.string.optional({ trim: true }, [Validator_1.rules.maxLength(1000)]),
            phone_number: Validator_1.schema.string.optional({ trim: true }, [Validator_1.rules.maxLength(50)]),
            email: Validator_1.schema.string.optional({ trim: true }, [Validator_1.rules.email(), Validator_1.rules.maxLength(255)]),
            logo: Validator_1.schema.string.optional({ trim: true }, [Validator_1.rules.maxLength(500)]),
            opening_time: Validator_1.schema.string.optional({ trim: true }, [Validator_1.rules.maxLength(20)]),
            closing_time: Validator_1.schema.string.optional({ trim: true }, [Validator_1.rules.maxLength(20)]),
            delivery_radius: Validator_1.schema.number.optional([Validator_1.rules.range(0.1, 500)]),
            status: Validator_1.schema.enum.optional(Object.values(Status_1.RestaurantStatus)),
        });
        this.messages = {
            'email.email': 'Valid email address is required',
        };
    }
}
exports.default = UpdateRestaurantValidator;
//# sourceMappingURL=UpdateRestaurantValidator.js.map