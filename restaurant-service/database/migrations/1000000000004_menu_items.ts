import Schema from '@ioc:Adonis/Lucid/Schema'

export default class MenuItemsSchema extends Schema {
  protected tableName = 'menu_items'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .uuid('restaurant_id')
        .notNullable()
        .references('id')
        .inTable('restaurants')
        .onDelete('CASCADE')
        .index()
      table
        .uuid('category_id')
        .notNullable()
        .references('id')
        .inTable('categories')
        .onDelete('CASCADE')
        .index()
      table.string('name', 255).notNullable()
      table.text('description').nullable()
      table.decimal('price', 10, 2).notNullable()
      table.string('image', 500).nullable()
      table.boolean('is_vegetarian').notNullable().defaultTo(false)
      table.integer('preparation_time').notNullable().defaultTo(15) // minutes
      table.boolean('is_available').notNullable().defaultTo(true)
      table.string('status', 20).notNullable().defaultTo('ENABLED').index()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
