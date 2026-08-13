"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RestaurantService_1 = global[Symbol.for('ioc.use')]("App/Services/RestaurantService");
const ApiResponse_1 = global[Symbol.for('ioc.use')]("App/Response/ApiResponse");
const CreateRestaurantAddressValidator_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Validators/CreateRestaurantAddressValidator"));
const UpdateRestaurantAddressValidator_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Validators/UpdateRestaurantAddressValidator"));
class RestaurantAddressController {
    constructor() {
        this.restaurantService = new RestaurantService_1.RestaurantService();
    }
    async store(ctx) {
        const user = ctx.auth.user;
        const restaurantId = ctx.params.restaurantId;
        const payload = await ctx.request.validate(CreateRestaurantAddressValidator_1.default);
        const address = await this.restaurantService.createAddress(restaurantId, user.id, user.roles, payload);
        return ApiResponse_1.ApiResponse.success(ctx, address, 'Restaurant address saved successfully', {}, 201);
    }
    async show(ctx) {
        const restaurantId = ctx.params.restaurantId;
        const address = await this.restaurantService.getAddress(restaurantId);
        return ApiResponse_1.ApiResponse.success(ctx, address, 'Restaurant address retrieved successfully');
    }
    async update(ctx) {
        const user = ctx.auth.user;
        const restaurantId = ctx.params.restaurantId;
        const payload = await ctx.request.validate(UpdateRestaurantAddressValidator_1.default);
        const address = await this.restaurantService.updateAddress(restaurantId, user.id, user.roles, payload);
        return ApiResponse_1.ApiResponse.success(ctx, address, 'Restaurant address updated successfully');
    }
    async destroy(ctx) {
        const user = ctx.auth.user;
        const restaurantId = ctx.params.restaurantId;
        const address = await this.restaurantService.deleteAddress(restaurantId, user.id, user.roles);
        return ApiResponse_1.ApiResponse.success(ctx, address, 'Restaurant address soft deleted successfully');
    }
    async restore(ctx) {
        const user = ctx.auth.user;
        const restaurantId = ctx.params.restaurantId;
        const address = await this.restaurantService.restoreAddress(restaurantId, user.id, user.roles);
        return ApiResponse_1.ApiResponse.success(ctx, address, 'Restaurant address restored successfully');
    }
}
exports.default = RestaurantAddressController;
//# sourceMappingURL=RestaurantAddressController.js.map