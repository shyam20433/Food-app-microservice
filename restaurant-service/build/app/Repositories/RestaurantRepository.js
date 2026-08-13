"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantRepository = void 0;
const Restaurant_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Restaurant"));
const Status_1 = global[Symbol.for('ioc.use')]("App/Constants/Status");
const CustomExceptions_1 = global[Symbol.for('ioc.use')]("App/Exceptions/CustomExceptions");
class RestaurantRepository {
    async insert(data, options) {
        const restaurant = new Restaurant_1.default();
        restaurant.fill(data);
        if (options?.client) {
            restaurant.useTransaction(options.client);
        }
        await restaurant.save();
        return restaurant;
    }
    async findById(id, includeDetails = false) {
        const query = Restaurant_1.default.query()
            .where('id', id)
            .andWhere('status', '!=', Status_1.RestaurantStatus.DELETED);
        if (includeDetails) {
            query
                .preload('address', (addressQuery) => {
                addressQuery.where('status', '!=', 'DELETED');
            })
                .preload('categories', (categoryQuery) => {
                categoryQuery.where('status', '!=', 'DELETED');
            })
                .preload('menuItems', (menuQuery) => {
                menuQuery.where('status', '!=', 'DELETED');
            });
        }
        return await query.first();
    }
    async findByOwnerId(ownerId, options) {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const paginated = await Restaurant_1.default.query()
            .where('owner_id', ownerId)
            .andWhere('status', '!=', Status_1.RestaurantStatus.DELETED)
            .preload('address', (aq) => aq.where('status', '!=', 'DELETED'))
            .orderBy('created_at', 'desc')
            .paginate(page, limit);
        const json = paginated.toJSON();
        return {
            data: json.data,
            meta: json.meta,
        };
    }
    async findAll(options) {
        const page = options?.page || 1;
        const limit = options?.limit || 20;
        const targetStatus = options?.status && options.status !== Status_1.RestaurantStatus.DELETED
            ? options.status
            : Status_1.RestaurantStatus.ENABLED;
        const query = Restaurant_1.default.query().where('status', targetStatus);
        if (options?.search) {
            const searchPattern = `%${options.search}%`;
            query.andWhere((q) => {
                q.where('name', 'ILIKE', searchPattern).orWhere('description', 'ILIKE', searchPattern);
            });
        }
        query
            .preload('address', (aq) => aq.where('status', '!=', 'DELETED'))
            .orderBy('created_at', 'desc');
        const paginated = await query.paginate(page, limit);
        const json = paginated.toJSON();
        return {
            data: json.data,
            meta: json.meta,
        };
    }
    async update(id, data) {
        const restaurant = await Restaurant_1.default.query()
            .where('id', id)
            .andWhere('status', '!=', Status_1.RestaurantStatus.DELETED)
            .first();
        if (!restaurant) {
            throw new CustomExceptions_1.RestaurantNotFoundException();
        }
        restaurant.merge(data);
        await restaurant.save();
        return restaurant;
    }
    async setStatus(id, status) {
        const restaurant = await Restaurant_1.default.find(id);
        if (!restaurant) {
            throw new CustomExceptions_1.RestaurantNotFoundException();
        }
        restaurant.status = status;
        await restaurant.save();
        return restaurant;
    }
}
exports.RestaurantRepository = RestaurantRepository;
//# sourceMappingURL=RestaurantRepository.js.map