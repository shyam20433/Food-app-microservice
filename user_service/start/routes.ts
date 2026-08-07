import Route from '@ioc:Adonis/Core/Route'

// Health Check Endpoints (Public & K8s Probes)
Route.group(() => {
  Route.get('/', 'HealthController.check')
  Route.get('/live', 'HealthController.live')
  Route.get('/ready', 'HealthController.ready')
}).prefix('/health')

// Authentication Routes (Public & Auth)
Route.group(() => {
  Route.post('/register', 'AuthController.register')
  Route.post('/register-full', 'AuthController.registerFull')
  Route.post('/login', 'AuthController.login')
  Route.post('/refresh', 'AuthController.refresh')

  Route.group(() => {
    Route.post('/logout', 'AuthController.logout')
    Route.get('/me', 'AuthController.me')
  }).middleware('jwtAuth')
}).prefix('/auth')

// User Management Routes
Route.group(() => {
  Route.get('/', 'UserController.index')
  Route.get('/:id', 'UserController.show')
  Route.put('/:id', 'UserController.update')
  Route.delete('/:id', 'UserController.destroy')
  Route.post('/change-password', 'UserController.changePassword')

  // Explicit Role Assignment & Removal (Admin / Super Admin protected)
  Route.post('/:id/assign-role', 'UserController.assignRole').middleware('role:ADMIN,SUPER_ADMIN')
  Route.delete('/:id/remove-role', 'UserController.removeRole').middleware('role:ADMIN,SUPER_ADMIN')
  Route.delete('/:id/roles/:roleName', 'UserController.removeRole').middleware(
    'role:ADMIN,SUPER_ADMIN'
  )
})
  .prefix('/users')
  .middleware('jwtAuth')

// Read-Only System Roles Routes
Route.group(() => {
  Route.get('/', 'RoleController.index')
  Route.get('/:name', 'RoleController.show')
})
  .prefix('/roles')
  .middleware('jwtAuth')

// Address Management Routes
Route.group(() => {
  Route.get('/', 'AddressController.index')
  Route.post('/', 'AddressController.store')
  Route.get('/:id', 'AddressController.show')
  Route.put('/:id', 'AddressController.update')
  Route.delete('/:id', 'AddressController.destroy')
  Route.put('/:id/default', 'AddressController.setDefault')
})
  .prefix('/addresses')
  .middleware('jwtAuth')
