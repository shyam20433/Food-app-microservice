"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuItemRepository = void 0;
const MenuItem_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/MenuItem"));
const Status_1 = global[Symbol.for('ioc.use')]("App/Constants/Status");
const CustomExceptions_1 = global[Symbol.for('ioc.use')]("App/Exceptions/CustomExceptions");
class MenuItemRepository {
    async insert(data) {
        const menuItem = new MenuItem_1.default();
        menuItem.fill(data);
        await menuItem.save();
        return menuItem;
    }
    async findById(id) {
        return await MenuItem_1.default.query()
            .where('id', id)
            .andWhere('status', '!=', Status_1.MenuItemStatus.DELETED)
            .preload('category')
            .first();
    }
    async findByRestaurantId(restaurantId) {
        return await MenuItem_1.default.query()
            .where('restaurant_id', restaurantId)
            .andWhere('status', '!=', Status_1.MenuItemStatus.DELETED)
            .preload('category')
            .orderBy('name', 'asc');
    }
    async findByCategoryId(categoryId) {
        return await MenuItem_1.default.query()
            .where('category_id', categoryId)
            .andWhere('status', '!=', Status_1.MenuItemStatus.DELETED)
            .orderBy('name', 'asc');
    }
    async update(id, data) {
        const menuItem = await MenuItem_1.default.query()
            .where('id', id)
            .andWhere('status', '!=', Status_1.MenuItemStatus.DELETED)
            .first();
        if (!menuItem) {
            throw new CustomExceptions_1.MenuItemNotFoundException();
        }
        menuItem.merge(data);
        await menuItem.save();
        return menuItem;
    }
    async setAvailability(id, isAvailable) {
        const menuItem = await MenuItem_1.default.query()
            .where('id', id)
            .andWhere('status', '!=', Status_1.MenuItemStatus.DELETED)
            .first();
        if (!menuItem) {
            throw new CustomExceptions_1.MenuItemNotFoundException();
        }
        menuItem.isAvailable = isAvailable;
        await menuItem.save();
        return menuItem;
    }
    async setStatus(id, status) {
        const menuItem = await MenuItem_1.default.find(id);
        if (!menuItem) {
            throw new CustomExceptions_1.MenuItemNotFoundException();
        }
        menuItem.status = status;
        await menuItem.save();
        return menuItem;
    }
}
exports.MenuItemRepository = MenuItemRepository;
//# sourceMappingURL=MenuItemRepository.js.map