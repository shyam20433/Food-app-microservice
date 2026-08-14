import Env from '@ioc:Adonis/Core/Env'

export default Env.rules({
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  APP_KEY: Env.schema.string(),
  APP_NAME: Env.schema.string(),
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PG_HOST: Env.schema.string(),
  PG_PORT: Env.schema.number(),
  PG_USER: Env.schema.string(),
  PG_PASSWORD: Env.schema.string(),
  PG_DB_NAME: Env.schema.string(),
  JWT_SECRET: Env.schema.string(),
  USER_SERVICE_URL: Env.schema.string(),
  RESTAURANT_SERVICE_URL: Env.schema.string(),
  ORDER_SERVICE_URL: Env.schema.string(),
})
