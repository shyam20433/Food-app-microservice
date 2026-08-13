import Schema from '@ioc:Adonis/Lucid/Schema'

export default class CartItemsSchema extends Schema {
  protected tableName = 'cart_items'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table
        .uuid('cart_id')
        .notNullable()
        .references('id')
        .inTable('carts')
        .onDelete('CASCADE')
        .index()
      table.uuid('menu_item_id').notNullable().index()
      table.integer('quantity').notNullable().defaultTo(1)
      table.decimal('price', 10, 2).notNullable()
      table.decimal('subtotal', 10, 2).notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
