"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantService = void 0;
const Database_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Database"));
const RestaurantRepository_1 = global[Symbol.for('ioc.use')]("App/Repositories/RestaurantRepository");
const RestaurantAddressRepository_1 = global[Symbol.for('ioc.use')]("App/Repositories/RestaurantAddressRepository");
const CategoryRepository_1 = global[Symbol.for('ioc.use')]("App/Repositories/CategoryRepository");
const MenuItemRepository_1 = global[Symbol.for('ioc.use')]("App/Repositories/MenuItemRepository");
const Restaurant_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Restaurant"));
const Category_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Category"));
const MenuItem_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/MenuItem"));
const Status_1 = global[Symbol.for('ioc.use')]("App/Constants/Status");
const Roles_1 = global[Symbol.for('ioc.use')]("App/Constants/Roles");
const CustomExceptions_1 = global[Symbol.for('ioc.use')]("App/Exceptions/CustomExceptions");
class RestaurantService {
    constructor() {
        this.restaurantRepo = new RestaurantRepository_1.RestaurantRepository();
        this.addressRepo = new RestaurantAddressRepository_1.RestaurantAddressRepository();
        this.categoryRepo = new CategoryRepository_1.CategoryRepository();
        this.menuItemRepo = new MenuItemRepository_1.MenuItemRepository();
    }
    ensureOwnershipOrAdmin(restaurantOwnerId, userId, roles = []) {
        const isAdmin = roles.includes(Roles_1.Roles.ADMIN) || roles.includes(Roles_1.Roles.SUPER_ADMIN);
        if (!isAdmin && restaurantOwnerId !== userId) {
            throw new CustomExceptions_1.RestaurantAccessDeniedException();
        }
    }
    async createRestaurant(userId, roles, payload) {
        const isAdmin = roles.includes(Roles_1.Roles.ADMIN) || roles.includes(Roles_1.Roles.SUPER_ADMIN);
        const finalOwnerId = isAdmin && payload.owner_id ? payload.owner_id : userId;
        const trx = await Database_1.default.transaction();
        try {
            const restaurantData = {
                ownerId: finalOwnerId,
                name: payload.name,
                description: payload.description || null,
                phoneNumber: payload.phone_number,
                email: payload.email,
                logo: payload.logo || null,
                openingTime: payload.opening_time || null,
                closingTime: payload.closing_time || null,
                deliveryRadius: payload.delivery_radius || 5.0,
                status: payload.status || Status_1.RestaurantStatus.ENABLED,
            };
            const restaurant = await this.restaurantRepo.insert(restaurantData, { client: trx });
            if (payload.address) {
                const addressData = {
                    restaurantId: restaurant.id,
                    houseNo: payload.address.house_no,
                    street: payload.address.street,
                    area: payload.address.area || null,
                    city: payload.address.city,
                    state: payload.address.state,
                    pincode: payload.address.pincode,
                    latitude: payload.address.latitude !== undefined ? payload.address.latitude : null,
                    longitude: payload.address.longitude !== undefined ? payload.address.longitude : null,
                    status: Status_1.AddressStatus.ENABLED,
                };
                await this.addressRepo.insert(addressData, { client: trx });
            }
            await trx.commit();
            const result = await this.restaurantRepo.findById(restaurant.id, true);
            return result;
        }
        catch (error) {
            await trx.rollback();
            throw error;
        }
    }
    async getRestaurantById(id) {
        const restaurant = await this.restaurantRepo.findById(id, true);
        if (!restaurant) {
            throw new CustomExceptions_1.RestaurantNotFoundException();
        }
        return restaurant;
    }
    async listRestaurants(params) {
        return await this.restaurantRepo.findAll(params);
    }
    async updateRestaurant(id, userId, roles, payload) {
        const restaurant = await this.getRestaurantById(id);
        this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles);
        const updateData = {};
        if (payload.name !== undefined)
            updateData.name = payload.name;
        if (payload.description !== undefined)
            updateData.description = payload.description;
        if (payload.phone_number !== undefined)
            updateData.phoneNumber = payload.phone_number;
        if (payload.email !== undefined)
            updateData.email = payload.email;
        if (payload.logo !== undefined)
            updateData.logo = payload.logo;
        if (payload.opening_time !== undefined)
            updateData.openingTime = payload.opening_time;
        if (payload.closing_time !== undefined)
            updateData.closingTime = payload.closing_time;
        if (payload.delivery_radius !== undefined)
            updateData.deliveryRadius = payload.delivery_radius;
        if (payload.status !== undefined)
            updateData.status = payload.status;
        return await this.restaurantRepo.update(id, updateData);
    }
    async deleteRestaurant(id, userId, roles) {
        const restaurant = await this.getRestaurantById(id);
        this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles);
        return await this.restaurantRepo.setStatus(id, Status_1.RestaurantStatus.DELETED);
    }
    async setRestaurantStatus(id, userId, roles, status) {
        if (status === Status_1.RestaurantStatus.DELETED) {
            throw new CustomExceptions_1.BadRequestException('DELETED status cannot be set via PATCH /status. Soft deletion must be performed via DELETE /restaurants/:id');
        }
        const restaurant = await this.getRestaurantById(id);
        this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles);
        return await this.restaurantRepo.setStatus(id, status);
    }
    async createAddress(restaurantId, userId, roles, payload) {
        const restaurant = await this.getRestaurantById(restaurantId);
        this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles);
        const existing = await this.addressRepo.findByRestaurantId(restaurantId);
        if (existing) {
            throw new CustomExceptions_1.AddressAlreadyExistsException();
        }
        return await this.addressRepo.insert({
            restaurantId: restaurantId,
            houseNo: payload.house_no,
            street: payload.street,
            area: payload.area || null,
            city: payload.city,
            state: payload.state,
            pincode: payload.pincode,
            latitude: payload.latitude !== undefined ? payload.latitude : null,
            longitude: payload.longitude !== undefined ? payload.longitude : null,
            status: payload.status || Status_1.AddressStatus.ENABLED,
        });
    }
    async getAddress(restaurantId) {
        await this.getRestaurantById(restaurantId);
        const address = await this.addressRepo.findByRestaurantId(restaurantId);
        if (!address) {
            throw new CustomExceptions_1.AddressNotFoundException();
        }
        return address;
    }
    async updateAddress(restaurantId, userId, roles, payload) {
        const restaurant = await this.getRestaurantById(restaurantId);
        this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles);
        const updateData = {};
        if (payload.house_no !== undefined)
            updateData.houseNo = payload.house_no;
        if (payload.street !== undefined)
            updateData.street = payload.street;
        if (payload.area !== undefined)
            updateData.area = payload.area;
        if (payload.city !== undefined)
            updateData.city = payload.city;
        if (payload.state !== undefined)
            updateData.state = payload.state;
        if (payload.pincode !== undefined)
            updateData.pincode = payload.pincode;
        if (payload.latitude !== undefined)
            updateData.latitude = payload.latitude;
        if (payload.longitude !== undefined)
            updateData.longitude = payload.longitude;
        if (payload.status !== undefined)
            updateData.status = payload.status;
        return await this.addressRepo.update(restaurantId, updateData);
    }
    async deleteAddress(restaurantId, userId, roles) {
        const restaurant = await this.getRestaurantById(restaurantId);
        this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles);
        return await this.addressRepo.setStatus(restaurantId, Status_1.AddressStatus.DELETED);
    }
    async createCategory(restaurantId, userId, roles, payload) {
        const restaurant = await this.getRestaurantById(restaurantId);
        this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles);
        return await this.categoryRepo.insert({
            restaurantId: restaurantId,
            name: payload.name,
            description: payload.description || null,
            status: payload.status || Status_1.CategoryStatus.ENABLED,
        });
    }
    async getCategories(restaurantId) {
        await this.getRestaurantById(restaurantId);
        return await this.categoryRepo.findByRestaurantId(restaurantId);
    }
    async getCategoryById(restaurantId, categoryId) {
        await this.getRestaurantById(restaurantId);
        const category = await this.categoryRepo.findById(categoryId);
        if (!category || category.restaurantId !== restaurantId) {
            throw new CustomExceptions_1.CategoryNotFoundException();
        }
        return category;
    }
    async updateCategory(restaurantId, categoryId, userId, roles, payload) {
        const restaurant = await this.getRestaurantById(restaurantId);
        this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles);
        const category = await this.getCategoryById(restaurantId, categoryId);
        const updateData = {};
        if (payload.name !== undefined)
            updateData.name = payload.name;
        if (payload.description !== undefined)
            updateData.description = payload.description;
        if (payload.status !== undefined)
            updateData.status = payload.status;
        return await this.categoryRepo.update(category.id, updateData);
    }
    async deleteCategory(restaurantId, categoryId, userId, roles) {
        const restaurant = await this.getRestaurantById(restaurantId);
        this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles);
        const category = await this.getCategoryById(restaurantId, categoryId);
        return await this.categoryRepo.setStatus(category.id, Status_1.CategoryStatus.DELETED);
    }
    async createMenuItem(restaurantId, userId, roles, payload) {
        const restaurant = await this.getRestaurantById(restaurantId);
        this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles);
        const category = await this.categoryRepo.findById(payload.category_id);
        if (!category || category.status === Status_1.CategoryStatus.DELETED) {
            throw new CustomExceptions_1.CategoryNotFoundException();
        }
        if (category.restaurantId !== restaurantId) {
            throw new CustomExceptions_1.CategoryNotBelongToRestaurantException();
        }
        return await this.menuItemRepo.insert({
            restaurantId: restaurantId,
            categoryId: payload.category_id,
            name: payload.name,
            description: payload.description || null,
            price: payload.price,
            image: payload.image || null,
            isVegetarian: payload.is_vegetarian !== undefined ? payload.is_vegetarian : false,
            preparationTime: payload.preparation_time !== undefined ? payload.preparation_time : 15,
            isAvailable: payload.is_available !== undefined ? payload.is_available : true,
            status: payload.status || Status_1.MenuItemStatus.ENABLED,
        });
    }
    async getMenuItems(restaurantId) {
        await this.getRestaurantById(restaurantId);
        return await this.menuItemRepo.findByRestaurantId(restaurantId);
    }
    async getMenuItemById(restaurantId, itemId) {
        await this.getRestaurantById(restaurantId);
        const menuItem = await this.menuItemRepo.findById(itemId);
        if (!menuItem || menuItem.restaurantId !== restaurantId) {
            throw new CustomExceptions_1.MenuItemNotFoundException();
        }
        return menuItem;
    }
    async updateMenuItem(restaurantId, itemId, userId, roles, payload) {
        const restaurant = await this.getRestaurantById(restaurantId);
        this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles);
        const menuItem = await this.getMenuItemById(restaurantId, itemId);
        if (payload.category_id) {
            const category = await this.categoryRepo.findById(payload.category_id);
            if (!category || category.status === Status_1.CategoryStatus.DELETED) {
                throw new CustomExceptions_1.CategoryNotFoundException();
            }
            if (category.restaurantId !== restaurantId) {
                throw new CustomExceptions_1.CategoryNotBelongToRestaurantException();
            }
        }
        const updateData = {};
        if (payload.category_id !== undefined)
            updateData.categoryId = payload.category_id;
        if (payload.name !== undefined)
            updateData.name = payload.name;
        if (payload.description !== undefined)
            updateData.description = payload.description;
        if (payload.price !== undefined)
            updateData.price = payload.price;
        if (payload.image !== undefined)
            updateData.image = payload.image;
        if (payload.is_vegetarian !== undefined)
            updateData.isVegetarian = payload.is_vegetarian;
        if (payload.preparation_time !== undefined)
            updateData.preparationTime = payload.preparation_time;
        if (payload.is_available !== undefined)
            updateData.isAvailable = payload.is_available;
        if (payload.status !== undefined)
            updateData.status = payload.status;
        return await this.menuItemRepo.update(menuItem.id, updateData);
    }
    async setMenuItemAvailability(restaurantId, itemId, userId, roles, isAvailable) {
        const restaurant = await this.getRestaurantById(restaurantId);
        this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles);
        const menuItem = await this.getMenuItemById(restaurantId, itemId);
        return await this.menuItemRepo.setAvailability(menuItem.id, isAvailable);
    }
    async restoreRestaurant(id, userId, roles) {
        const restaurant = await Restaurant_1.default.find(id);
        if (!restaurant) {
            throw new CustomExceptions_1.RestaurantNotFoundException();
        }
        this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles);
        return await this.restaurantRepo.setStatus(id, Status_1.RestaurantStatus.ENABLED);
    }
    async restoreAddress(restaurantId, userId, roles) {
        const restaurant = await this.getRestaurantById(restaurantId);
        this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles);
        return await this.addressRepo.setStatus(restaurantId, Status_1.AddressStatus.ENABLED);
    }
    async restoreCategory(restaurantId, categoryId, userId, roles) {
        const restaurant = await this.getRestaurantById(restaurantId);
        this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles);
        const category = await Category_1.default.find(categoryId);
        if (!category || category.restaurantId !== restaurantId) {
            throw new CustomExceptions_1.CategoryNotFoundException();
        }
        return await this.categoryRepo.setStatus(category.id, Status_1.CategoryStatus.ENABLED);
    }
    async restoreMenuItem(restaurantId, itemId, userId, roles) {
        const restaurant = await this.getRestaurantById(restaurantId);
        this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles);
        const menuItem = await MenuItem_1.default.find(itemId);
        if (!menuItem || menuItem.restaurantId !== restaurantId) {
            throw new CustomExceptions_1.MenuItemNotFoundException();
        }
        return await this.menuItemRepo.setStatus(menuItem.id, Status_1.MenuItemStatus.ENABLED);
    }
    async deleteMenuItem(restaurantId, itemId, userId, roles) {
        const restaurant = await this.getRestaurantById(restaurantId);
        this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles);
        const menuItem = await this.getMenuItemById(restaurantId, itemId);
        return await this.menuItemRepo.setStatus(menuItem.id, Status_1.MenuItemStatus.DELETED);
    }
}
exports.RestaurantService = RestaurantService;
//# sourceMappingURL=RestaurantService.js.map