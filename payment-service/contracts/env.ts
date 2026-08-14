declare module '@ioc:Adonis/Core/Env' {
  export interface EnvTypes {
    PORT: number
    HOST: string
    NODE_ENV: 'development' | 'production' | 'test'
    APP_KEY: string
    APP_NAME: string
    DB_CONNECTION: string
    PG_HOST: string
    PG_PORT: number
    PG_USER: string
    PG_PASSWORD: string
    PG_DB_NAME: string
    JWT_SECRET: string
    JWT_EXPIRES_IN?: string
    ORDER_SERVICE_URL?: string
    USER_SERVICE_URL?: string
    DEFAULT_PAYMENT_GATEWAY?: string
  }
}
