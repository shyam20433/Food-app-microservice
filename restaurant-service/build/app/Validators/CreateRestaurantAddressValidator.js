"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Validator_1 = global[Symbol.for('ioc.use')]("Adonis/Core/Validator");
const Status_1 = global[Symbol.for('ioc.use')]("App/Constants/Status");
class CreateRestaurantAddressValidator {
    constructor(ctx) {
        this.ctx = ctx;
        this.schema = Validator_1.schema.create({
            house_no: Validator_1.schema.string({ trim: true }, [Validator_1.rules.maxLength(100)]),
            street: Validator_1.schema.string({ trim: true }, [Validator_1.rules.maxLength(255)]),
            area: Validator_1.schema.string.optional({ trim: true }, [Validator_1.rules.maxLength(255)]),
            city: Validator_1.schema.string({ trim: true }, [Validator_1.rules.maxLength(100)]),
            state: Validator_1.schema.string({ trim: true }, [Validator_1.rules.maxLength(100)]),
            pincode: Validator_1.schema.string({ trim: true }, [Validator_1.rules.maxLength(20)]),
            latitude: Validator_1.schema.number.optional([Validator_1.rules.range(-90, 90)]),
            longitude: Validator_1.schema.number.optional([Validator_1.rules.range(-180, 180)]),
            status: Validator_1.schema.enum.optional(Object.values(Status_1.AddressStatus)),
        });
        this.messages = {
            'house_no.required': 'House number is required',
            'street.required': 'Street is required',
            'city.required': 'City is required',
            'state.required': 'State is required',
            'pincode.required': 'Pincode is required',
        };
    }
}
exports.default = CreateRestaurantAddressValidator;
//# sourceMappingURL=CreateRestaurantAddressValidator.js.map