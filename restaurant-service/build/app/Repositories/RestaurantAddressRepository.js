"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantAddressRepository = void 0;
const RestaurantAddress_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/RestaurantAddress"));
const Status_1 = global[Symbol.for('ioc.use')]("App/Constants/Status");
const CustomExceptions_1 = global[Symbol.for('ioc.use')]("App/Exceptions/CustomExceptions");
class RestaurantAddressRepository {
    async insert(data, options) {
        const address = new RestaurantAddress_1.default();
        address.fill(data);
        if (options?.client) {
            address.useTransaction(options.client);
        }
        await address.save();
        return address;
    }
    async findByRestaurantId(restaurantId) {
        return await RestaurantAddress_1.default.query()
            .where('restaurant_id', restaurantId)
            .andWhere('status', '!=', Status_1.AddressStatus.DELETED)
            .first();
    }
    async update(restaurantId, data) {
        const address = await RestaurantAddress_1.default.query()
            .where('restaurant_id', restaurantId)
            .andWhere('status', '!=', Status_1.AddressStatus.DELETED)
            .first();
        if (!address) {
            throw new CustomExceptions_1.AddressNotFoundException();
        }
        address.merge(data);
        await address.save();
        return address;
    }
    async setStatus(restaurantId, status) {
        const address = await RestaurantAddress_1.default.query()
            .where('restaurant_id', restaurantId)
            .first();
        if (!address) {
            throw new CustomExceptions_1.AddressNotFoundException();
        }
        address.status = status;
        await address.save();
        return address;
    }
}
exports.RestaurantAddressRepository = RestaurantAddressRepository;
//# sourceMappingURL=RestaurantAddressRepository.js.map