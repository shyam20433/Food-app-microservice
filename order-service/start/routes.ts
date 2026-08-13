import Route from '@ioc:Adonis/Core/Route'

// Health Check Endpoints (Public & K8s Probes)
Route.group(() => {
  Route.get('/', 'HealthController.check')
  Route.get('/live', 'HealthController.live')
  Route.get('/ready', 'HealthController.ready')
}).prefix('/health')

// Shopping Cart Routes (Protected by JWT)
Route.group(() => {
  Route.get('/', 'CartController.index')
  Route.post('/items', 'CartController.addItem')
  Route.put('/items/:id', 'CartController.updateItem')
  Route.delete('/items/:id', 'CartController.removeItem')
  Route.delete('/', 'CartController.clear')
})
  .prefix('/cart')
  .middleware('jwtAuth')

// Customer Order Routes (Protected by JWT)
Route.group(() => {
  Route.post('/', 'OrderController.store')
  Route.get('/', 'OrderController.index')
  Route.get('/:id', 'OrderController.show')
  Route.post('/:id/cancel', 'OrderController.cancel')
})
  .prefix('/orders')
  .middleware('jwtAuth')

// Restaurant Order Management Routes (Protected by JWT & Roles)
Route.group(() => {
  Route.get('/', 'RestaurantOrderController.index')
  Route.get('/:id', 'RestaurantOrderController.show')
  Route.patch('/:id/confirm', 'RestaurantOrderController.confirm')
  Route.patch('/:id/reject', 'RestaurantOrderController.reject')
  Route.patch('/:id/preparing', 'RestaurantOrderController.preparing')
  Route.patch('/:id/ready', 'RestaurantOrderController.ready')
})
  .prefix('/restaurant-orders')
  .middleware(['jwtAuth', 'role:RESTAURANT_OWNER,ADMIN,SUPER_ADMIN'])
