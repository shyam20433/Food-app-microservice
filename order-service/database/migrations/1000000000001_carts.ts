import Schema from '@ioc:Adonis/Lucid/Schema'
import { CartStatus } from 'App/Constants/CartStatus'

export default class CartsSchema extends Schema {
  protected tableName = 'carts'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('user_id').notNullable().index()
      table.uuid('restaurant_id').nullable().index()
      table.string('status', 50).notNullable().defaultTo(CartStatus.ACTIVE).index()

      /**
       * Uses timestamptz for PostgreSQL
       */
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
