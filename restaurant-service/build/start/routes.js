"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Route_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Core/Route"));
Route_1.default.group(() => {
    Route_1.default.get('/', 'HealthController.check');
    Route_1.default.get('/live', 'HealthController.live');
    Route_1.default.get('/ready', 'HealthController.ready');
}).prefix('/health');
Route_1.default.group(() => {
    Route_1.default.get('/', 'RestaurantController.index');
    Route_1.default.get('/:id', 'RestaurantController.show');
    Route_1.default.get('/:restaurantId/address', 'RestaurantAddressController.show');
    Route_1.default.get('/:restaurantId/categories', 'CategoryController.index');
    Route_1.default.get('/:restaurantId/categories/:categoryId', 'CategoryController.show');
    Route_1.default.get('/:restaurantId/menu-items', 'MenuItemController.index');
    Route_1.default.get('/:restaurantId/menu-items/:itemId', 'MenuItemController.show');
}).prefix('/restaurants');
Route_1.default.group(() => {
    Route_1.default.post('/', 'RestaurantController.store');
    Route_1.default.put('/:id', 'RestaurantController.update');
    Route_1.default.delete('/:id', 'RestaurantController.destroy');
    Route_1.default.patch('/:id/status', 'RestaurantController.updateStatus');
    Route_1.default.patch('/:id/restore', 'RestaurantController.restore');
    Route_1.default.post('/:restaurantId/address', 'RestaurantAddressController.store');
    Route_1.default.put('/:restaurantId/address', 'RestaurantAddressController.update');
    Route_1.default.delete('/:restaurantId/address', 'RestaurantAddressController.destroy');
    Route_1.default.patch('/:restaurantId/address/restore', 'RestaurantAddressController.restore');
    Route_1.default.post('/:restaurantId/categories', 'CategoryController.store');
    Route_1.default.put('/:restaurantId/categories/:categoryId', 'CategoryController.update');
    Route_1.default.delete('/:restaurantId/categories/:categoryId', 'CategoryController.destroy');
    Route_1.default.patch('/:restaurantId/categories/:categoryId/restore', 'CategoryController.restore');
    Route_1.default.post('/:restaurantId/menu-items', 'MenuItemController.store');
    Route_1.default.put('/:restaurantId/menu-items/:itemId', 'MenuItemController.update');
    Route_1.default.delete('/:restaurantId/menu-items/:itemId', 'MenuItemController.destroy');
    Route_1.default.patch('/:restaurantId/menu-items/:itemId/availability', 'MenuItemController.updateAvailability');
    Route_1.default.patch('/:restaurantId/menu-items/:itemId/restore', 'MenuItemController.restore');
})
    .prefix('/restaurants')
    .middleware(['jwtAuth', 'role:RESTAURANT_OWNER,ADMIN,SUPER_ADMIN']);
//# sourceMappingURL=routes.js.map