import Server from '@ioc:Adonis/Core/Server'

Server.middleware.register([
  () => import('@adonisjs/bodyparser/build/src/BodyParserMiddleware/index' as any),
])

Server.middleware.registerNamed({
  jwtAuth: () => import('App/Middleware/JwtAuth'),
  role: () => import('App/Middleware/RoleMiddleware'),
})
