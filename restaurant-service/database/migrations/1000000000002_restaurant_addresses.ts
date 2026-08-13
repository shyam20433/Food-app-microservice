import Schema from '@ioc:Adonis/Lucid/Schema'

export default class RestaurantAddressesSchema extends Schema {
  protected tableName = 'restaurant_addresses'

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
      table.string('house_no', 100).notNullable()
      table.string('street', 255).notNullable()
      table.string('area', 255).nullable()
      table.string('city', 100).notNullable()
      table.string('state', 100).notNullable()
      table.string('pincode', 20).notNullable()
      table.decimal('latitude', 10, 8).nullable()
      table.decimal('longitude', 11, 8).nullable()
      table.string('status', 20).notNullable().defaultTo('ENABLED').index()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
