"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RestaurantService_1 = global[Symbol.for('ioc.use')]("App/Services/RestaurantService");
const ApiResponse_1 = global[Symbol.for('ioc.use')]("App/Response/ApiResponse");
const CreateRestaurantValidator_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Validators/CreateRestaurantValidator"));
const UpdateRestaurantValidator_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Validators/UpdateRestaurantValidator"));
const UpdateRestaurantStatusValidator_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Validators/UpdateRestaurantStatusValidator"));
const PaginationValidator_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Validators/PaginationValidator"));
class RestaurantController {
    constructor() {
        this.restaurantService = new RestaurantService_1.RestaurantService();
    }
    async store(ctx) {
        const user = ctx.auth.user;
        const payload = await ctx.request.validate(CreateRestaurantValidator_1.default);
        const restaurant = await this.restaurantService.createRestaurant(user.id, user.roles, payload);
        return ApiResponse_1.ApiResponse.success(ctx, restaurant, 'Restaurant created successfully', {}, 201);
    }
    async index(ctx) {
        const params = await ctx.request.validate(PaginationValidator_1.default);
        const result = await this.restaurantService.listRestaurants(params);
        return ApiResponse_1.ApiResponse.success(ctx, result.data, 'Restaurants retrieved successfully', result.meta);
    }
    async show(ctx) {
        const id = ctx.params.id;
        const restaurant = await this.restaurantService.getRestaurantById(id);
        return ApiResponse_1.ApiResponse.success(ctx, restaurant, 'Restaurant retrieved successfully');
    }
    async update(ctx) {
        const user = ctx.auth.user;
        const id = ctx.params.id;
        const payload = await ctx.request.validate(UpdateRestaurantValidator_1.default);
        const restaurant = await this.restaurantService.updateRestaurant(id, user.id, user.roles, payload);
        return ApiResponse_1.ApiResponse.success(ctx, restaurant, 'Restaurant updated successfully');
    }
    async destroy(ctx) {
        const user = ctx.auth.user;
        const id = ctx.params.id;
        const restaurant = await this.restaurantService.deleteRestaurant(id, user.id, user.roles);
        return ApiResponse_1.ApiResponse.success(ctx, restaurant, 'Restaurant soft deleted successfully');
    }
    async restore(ctx) {
        const user = ctx.auth.user;
        const id = ctx.params.id;
        const restaurant = await this.restaurantService.restoreRestaurant(id, user.id, user.roles);
        return ApiResponse_1.ApiResponse.success(ctx, restaurant, 'Restaurant restored successfully');
    }
    async updateStatus(ctx) {
        const user = ctx.auth.user;
        const id = ctx.params.id;
        const payload = await ctx.request.validate(UpdateRestaurantStatusValidator_1.default);
        const restaurant = await this.restaurantService.setRestaurantStatus(id, user.id, user.roles, payload.status);
        return ApiResponse_1.ApiResponse.success(ctx, restaurant, 'Restaurant status updated successfully');
    }
}
exports.default = RestaurantController;
//# sourceMappingURL=RestaurantController.js.map