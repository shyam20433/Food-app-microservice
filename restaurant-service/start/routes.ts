import Route from '@ioc:Adonis/Core/Route'

// Health Check Endpoints (Public & K8s Probes)
Route.group(() => {
  Route.get('/', 'HealthController.check')
  Route.get('/live', 'HealthController.live')
  Route.get('/ready', 'HealthController.ready')
}).prefix('/health')

// Restaurant Public Read Routes
Route.group(() => {
  Route.get('/', 'RestaurantController.index')
  Route.get('/:id', 'RestaurantController.show')

  // Restaurant Address Read Route
  Route.get('/:restaurantId/address', 'RestaurantAddressController.show')

  // Categories Read Routes
  Route.get('/:restaurantId/categories', 'CategoryController.index')
  Route.get('/:restaurantId/categories/:categoryId', 'CategoryController.show')

  // Menu Items Read Routes
  Route.get('/:restaurantId/menu-items', 'MenuItemController.index')
  Route.get('/:restaurantId/menu-items/:itemId', 'MenuItemController.show')
}).prefix('/restaurants')

// Protected Restaurant & Management Routes
Route.group(() => {
  // Restaurant CRUD Operations
  Route.post('/', 'RestaurantController.store')
  Route.put('/:id', 'RestaurantController.update')
  Route.delete('/:id', 'RestaurantController.destroy')
  Route.patch('/:id/status', 'RestaurantController.updateStatus')
  Route.patch('/:id/restore', 'RestaurantController.restore')

  // Restaurant Address Operations
  Route.post('/:restaurantId/address', 'RestaurantAddressController.store')
  Route.put('/:restaurantId/address', 'RestaurantAddressController.update')
  Route.delete('/:restaurantId/address', 'RestaurantAddressController.destroy')
  Route.patch('/:restaurantId/address/restore', 'RestaurantAddressController.restore')

  // Category Operations
  Route.post('/:restaurantId/categories', 'CategoryController.store')
  Route.put('/:restaurantId/categories/:categoryId', 'CategoryController.update')
  Route.delete('/:restaurantId/categories/:categoryId', 'CategoryController.destroy')
  Route.patch('/:restaurantId/categories/:categoryId/restore', 'CategoryController.restore')

  // Menu Item Operations
  Route.post('/:restaurantId/menu-items', 'MenuItemController.store')
  Route.put('/:restaurantId/menu-items/:itemId', 'MenuItemController.update')
  Route.delete('/:restaurantId/menu-items/:itemId', 'MenuItemController.destroy')
  Route.patch('/:restaurantId/menu-items/:itemId/availability', 'MenuItemController.updateAvailability')
  Route.patch('/:restaurantId/menu-items/:itemId/restore', 'MenuItemController.restore')
})
  .prefix('/restaurants')
  .middleware(['jwtAuth', 'role:RESTAURANT_OWNER,ADMIN,SUPER_ADMIN'])
