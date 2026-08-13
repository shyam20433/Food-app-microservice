"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Validator_1 = global[Symbol.for('ioc.use')]("Adonis/Core/Validator");
const Status_1 = global[Symbol.for('ioc.use')]("App/Constants/Status");
class PaginationValidator {
    constructor(ctx) {
        this.ctx = ctx;
        this.schema = Validator_1.schema.create({
            page: Validator_1.schema.number.optional([Validator_1.rules.range(1, 10000)]),
            limit: Validator_1.schema.number.optional([Validator_1.rules.range(1, 100)]),
            search: Validator_1.schema.string.optional({ trim: true }),
            status: Validator_1.schema.enum.optional(Object.values(Status_1.RestaurantStatus)),
        });
        this.messages = {
            'page.range': 'Page must be between 1 and 10000',
            'limit.range': 'Limit must be between 1 and 100',
        };
    }
}
exports.default = PaginationValidator;
//# sourceMappingURL=PaginationValidator.js.map