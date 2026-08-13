"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RestaurantService_1 = global[Symbol.for('ioc.use')]("App/Services/RestaurantService");
const ApiResponse_1 = global[Symbol.for('ioc.use')]("App/Response/ApiResponse");
const CreateMenuItemValidator_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Validators/CreateMenuItemValidator"));
const UpdateMenuItemValidator_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Validators/UpdateMenuItemValidator"));
const UpdateAvailabilityValidator_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Validators/UpdateAvailabilityValidator"));
class MenuItemController {
    constructor() {
        this.restaurantService = new RestaurantService_1.RestaurantService();
    }
    async store(ctx) {
        const user = ctx.auth.user;
        const restaurantId = ctx.params.restaurantId;
        const payload = await ctx.request.validate(CreateMenuItemValidator_1.default);
        const menuItem = await this.restaurantService.createMenuItem(restaurantId, user.id, user.roles, payload);
        return ApiResponse_1.ApiResponse.success(ctx, menuItem, 'Menu item created successfully', {}, 201);
    }
    async index(ctx) {
        const restaurantId = ctx.params.restaurantId;
        const menuItems = await this.restaurantService.getMenuItems(restaurantId);
        return ApiResponse_1.ApiResponse.success(ctx, menuItems, 'Menu items retrieved successfully');
    }
    async show(ctx) {
        const restaurantId = ctx.params.restaurantId;
        const itemId = ctx.params.itemId;
        const menuItem = await this.restaurantService.getMenuItemById(restaurantId, itemId);
        return ApiResponse_1.ApiResponse.success(ctx, menuItem, 'Menu item retrieved successfully');
    }
    async update(ctx) {
        const user = ctx.auth.user;
        const restaurantId = ctx.params.restaurantId;
        const itemId = ctx.params.itemId;
        const payload = await ctx.request.validate(UpdateMenuItemValidator_1.default);
        const menuItem = await this.restaurantService.updateMenuItem(restaurantId, itemId, user.id, user.roles, payload);
        return ApiResponse_1.ApiResponse.success(ctx, menuItem, 'Menu item updated successfully');
    }
    async updateAvailability(ctx) {
        const user = ctx.auth.user;
        const restaurantId = ctx.params.restaurantId;
        const itemId = ctx.params.itemId;
        const payload = await ctx.request.validate(UpdateAvailabilityValidator_1.default);
        const menuItem = await this.restaurantService.setMenuItemAvailability(restaurantId, itemId, user.id, user.roles, payload.is_available);
        return ApiResponse_1.ApiResponse.success(ctx, menuItem, 'Menu item availability updated successfully');
    }
    async destroy(ctx) {
        const user = ctx.auth.user;
        const restaurantId = ctx.params.restaurantId;
        const itemId = ctx.params.itemId;
        const menuItem = await this.restaurantService.deleteMenuItem(restaurantId, itemId, user.id, user.roles);
        return ApiResponse_1.ApiResponse.success(ctx, menuItem, 'Menu item soft deleted successfully');
    }
    async restore(ctx) {
        const user = ctx.auth.user;
        const restaurantId = ctx.params.restaurantId;
        const itemId = ctx.params.itemId;
        const menuItem = await this.restaurantService.restoreMenuItem(restaurantId, itemId, user.id, user.roles);
        return ApiResponse_1.ApiResponse.success(ctx, menuItem, 'Menu item restored successfully');
    }
}
exports.default = MenuItemController;
//# sourceMappingURL=MenuItemController.js.map