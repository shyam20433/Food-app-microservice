import Schema from '@ioc:Adonis/Lucid/Schema'

export default class OrderItemsSchema extends Schema {
  protected tableName = 'order_items'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table
        .uuid('order_id')
        .notNullable()
        .references('id')
        .inTable('orders')
        .onDelete('CASCADE')
        .index()
      table.uuid('menu_item_id').notNullable().index()
      table.string('name', 255).notNullable()
      table.decimal('price', 10, 2).notNullable()
      table.integer('quantity').notNullable()
      table.decimal('subtotal', 10, 2).notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
