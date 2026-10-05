import Route from '@ioc:Adonis/Core/Route'


// Health Check Endpoints
Route.group(() => {
  Route.get('/', 'HealthController.check')
  Route.get('/live', 'HealthController.live')
  Route.get('/ready', 'HealthController.ready')
}).prefix('/health')

// Webhook Processing Route (Public / Gateway Callback)
Route.post('/webhooks/:gateway', 'WebhookController.handleWebhook')
Route.post('/webhooks', 'WebhookController.handleWebhook')

// Protected Payment Routes
Route.group(() => {
  Route.post('/', 'PaymentController.store').middleware('idempotency')
  Route.get('/', 'PaymentController.index')
  Route.get('/:id', 'PaymentController.show')
  Route.post('/:id/pay', 'PaymentController.pay')
  Route.post('/:id/refund', 'PaymentController.refund')
})
  .prefix('/payments')
  .middleware('jwtAuth')

// Admin Payment Routes (ADMIN / SUPER_ADMIN only)
Route.group(() => {
  Route.get('/payments', 'AdminPaymentController.index')
  Route.get('/payments/:id', 'AdminPaymentController.show')
})
  .prefix('/admin')
  .middleware(['jwtAuth', 'role:ADMIN,SUPER_ADMIN'])

