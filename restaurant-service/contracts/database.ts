declare module '@ioc:Adonis/Lucid/Database' {
  interface DatabaseConnectionsList {
    pg: DatabaseConfig['connections']['pg']
  }
}
