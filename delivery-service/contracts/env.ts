declare module '@ioc:Adonis/Core/Env' {
  interface EnvTypes {
    PORT: number
    HOST: string
    APP_KEY: string
    APP_NAME: string
    NODE_ENV: string
    PG_HOST: string
    PG_PORT: number
    PG_USER: string
    PG_PASSWORD: string
    PG_DB_NAME: string
    JWT_SECRET: string
    USER_SERVICE_URL: string
    RESTAURANT_SERVICE_URL: string
    ORDER_SERVICE_URL: string
  }
}
