import Env from '@ioc:Adonis/Core/Env'
import { DatabaseConfig } from '@ioc:Adonis/Lucid/Database'

const databaseConfig: DatabaseConfig = {
  connection: 'pg',
  connections: {
    pg: {
      client: 'pg',
      connection: {
        host: Env.get('PG_HOST', '127.0.0.1'),
        port: Env.get('PG_PORT', 5432),
        user: Env.get('PG_USER', 'postgres'),
        password: Env.get('PG_PASSWORD', '1234'),
        database: Env.get('PG_DB_NAME', 'delivery_db'),
      },
      migrations: {
        naturalSort: true,
      },
      healthCheck: true,
      debug: false,
    },
  },
}

export default databaseConfig
