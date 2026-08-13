"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const Category_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Category"));
const Status_1 = global[Symbol.for('ioc.use')]("App/Constants/Status");
const CustomExceptions_1 = global[Symbol.for('ioc.use')]("App/Exceptions/CustomExceptions");
class CategoryRepository {
    async insert(data) {
        const category = new Category_1.default();
        category.fill(data);
        await category.save();
        return category;
    }
    async findById(id) {
        return await Category_1.default.query()
            .where('id', id)
            .andWhere('status', '!=', Status_1.CategoryStatus.DELETED)
            .first();
    }
    async findByRestaurantId(restaurantId) {
        return await Category_1.default.query()
            .where('restaurant_id', restaurantId)
            .andWhere('status', '!=', Status_1.CategoryStatus.DELETED)
            .preload('menuItems', (mq) => mq.where('status', '!=', 'DELETED'))
            .orderBy('name', 'asc');
    }
    async update(id, data) {
        const category = await Category_1.default.query()
            .where('id', id)
            .andWhere('status', '!=', Status_1.CategoryStatus.DELETED)
            .first();
        if (!category) {
            throw new CustomExceptions_1.CategoryNotFoundException();
        }
        category.merge(data);
        await category.save();
        return category;
    }
    async setStatus(id, status) {
        const category = await Category_1.default.find(id);
        if (!category) {
            throw new CustomExceptions_1.CategoryNotFoundException();
        }
        category.status = status;
        await category.save();
        return category;
    }
}
exports.CategoryRepository = CategoryRepository;
//# sourceMappingURL=CategoryRepository.js.map