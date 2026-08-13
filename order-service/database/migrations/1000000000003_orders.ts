import Schema from '@ioc:Adonis/Lucid/Schema'
import { OrderStatus } from 'App/Constants/OrderStatus'
import { Status } from 'App/Constants/Status'

export default class OrdersSchema extends Schema {
  protected tableName = 'orders'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.string('order_number', 100).notNullable().unique().index()
      table.uuid('user_id').notNullable().index()
      table.uuid('restaurant_id').notNullable().index()
      table.jsonb('delivery_address').notNullable()
      table.decimal('total_amount', 10, 2).notNullable()
      table.string('order_status', 50).notNullable().defaultTo(OrderStatus.PENDING).index()
      table.string('status', 50).notNullable().defaultTo(Status.ENABLED).index()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
