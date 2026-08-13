import Server from '@ioc:Adonis/Core/Server'

Server.middleware.register([() => import('@ioc:Adonis/Core/BodyParser')])

Server.middleware.registerNamed({
  jwtAuth: () => import('App/Middleware/JwtAuth'),
  role: () => import('App/Middleware/RoleMiddleware'),
})
