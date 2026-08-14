import Route from '@ioc:Adonis/Core/Route'

// Health Probes
Route.group(() => {
  Route.get('/', 'HealthController.check')
  Route.get('/live', 'HealthController.live')
  Route.get('/ready', 'HealthController.ready')
}).prefix('/health')

// Delivery Partner Routes
Route.group(() => {
  Route.post('/', 'DeliveryPartnerController.register')
  Route.get('/me', 'DeliveryPartnerController.getMe')
  Route.put('/me', 'DeliveryPartnerController.updateMe')
  Route.patch('/me/availability', 'DeliveryPartnerController.updateAvailability')
  Route.get('/me/delivery', 'DeliveryPartnerController.getActiveDelivery')
  Route.get('/me/deliveries', 'DeliveryPartnerController.getPartnerDeliveries')
})
  .prefix('/delivery-partners')
  .middleware('jwtAuth')

// Delivery Routes
Route.group(() => {
  Route.post('/', 'DeliveryController.store')
  Route.get('/', 'DeliveryController.index')
  Route.get('/:id', 'DeliveryController.show')
  Route.post('/:id/assign', 'AssignmentController.assign')
  Route.patch('/:id/accept', 'DeliveryController.accept')
  Route.patch('/:id/reject', 'DeliveryController.reject')
  Route.patch('/:id/pickup', 'DeliveryController.pickup')
  Route.patch('/:id/out-for-delivery', 'DeliveryController.outForDelivery')
  Route.patch('/:id/delivered', 'DeliveryController.delivered')
})
  .prefix('/deliveries')
  .middleware('jwtAuth')

// Admin Routes
Route.group(() => {
  Route.get('/delivery-partners', 'AdminDeliveryController.getAllPartners')
  Route.patch('/delivery-partners/:id/status', 'AdminDeliveryController.setPartnerStatus')
  Route.get('/deliveries', 'AdminDeliveryController.getAllDeliveries')
})
  .prefix('/admin')
  .middleware(['jwtAuth', 'role:ADMIN,SUPER_ADMIN'])
