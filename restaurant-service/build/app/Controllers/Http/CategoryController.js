"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RestaurantService_1 = global[Symbol.for('ioc.use')]("App/Services/RestaurantService");
const ApiResponse_1 = global[Symbol.for('ioc.use')]("App/Response/ApiResponse");
const CreateCategoryValidator_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Validators/CreateCategoryValidator"));
const UpdateCategoryValidator_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Validators/UpdateCategoryValidator"));
class CategoryController {
    constructor() {
        this.restaurantService = new RestaurantService_1.RestaurantService();
    }
    async store(ctx) {
        const user = ctx.auth.user;
        const restaurantId = ctx.params.restaurantId;
        const payload = await ctx.request.validate(CreateCategoryValidator_1.default);
        const category = await this.restaurantService.createCategory(restaurantId, user.id, user.roles, payload);
        return ApiResponse_1.ApiResponse.success(ctx, category, 'Category created successfully', {}, 201);
    }
    async index(ctx) {
        const restaurantId = ctx.params.restaurantId;
        const categories = await this.restaurantService.getCategories(restaurantId);
        return ApiResponse_1.ApiResponse.success(ctx, categories, 'Categories retrieved successfully');
    }
    async show(ctx) {
        const restaurantId = ctx.params.restaurantId;
        const categoryId = ctx.params.categoryId;
        const category = await this.restaurantService.getCategoryById(restaurantId, categoryId);
        return ApiResponse_1.ApiResponse.success(ctx, category, 'Category retrieved successfully');
    }
    async update(ctx) {
        const user = ctx.auth.user;
        const restaurantId = ctx.params.restaurantId;
        const categoryId = ctx.params.categoryId;
        const payload = await ctx.request.validate(UpdateCategoryValidator_1.default);
        const category = await this.restaurantService.updateCategory(restaurantId, categoryId, user.id, user.roles, payload);
        return ApiResponse_1.ApiResponse.success(ctx, category, 'Category updated successfully');
    }
    async destroy(ctx) {
        const user = ctx.auth.user;
        const restaurantId = ctx.params.restaurantId;
        const categoryId = ctx.params.categoryId;
        const category = await this.restaurantService.deleteCategory(restaurantId, categoryId, user.id, user.roles);
        return ApiResponse_1.ApiResponse.success(ctx, category, 'Category soft deleted successfully');
    }
    async restore(ctx) {
        const user = ctx.auth.user;
        const restaurantId = ctx.params.restaurantId;
        const categoryId = ctx.params.categoryId;
        const category = await this.restaurantService.restoreCategory(restaurantId, categoryId, user.id, user.roles);
        return ApiResponse_1.ApiResponse.success(ctx, category, 'Category restored successfully');
    }
}
exports.default = CategoryController;
//# sourceMappingURL=CategoryController.js.map