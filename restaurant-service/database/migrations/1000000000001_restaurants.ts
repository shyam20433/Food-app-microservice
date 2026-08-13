import Schema from '@ioc:Adonis/Lucid/Schema'

export default class RestaurantsSchema extends Schema {
  protected tableName = 'restaurants'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('owner_id').notNullable().index()
      table.string('name', 255).notNullable()
      table.text('description').nullable()
      table.string('phone_number', 50).notNullable()
      table.string('email', 255).notNullable()
      table.string('logo', 500).nullable()
      table.string('opening_time', 20).nullable()
      table.string('closing_time', 20).nullable()
      table.decimal('delivery_radius', 8, 2).notNullable().defaultTo(5.00)
      table.string('status', 20).notNullable().defaultTo('ENABLED').index()

      /**
       * Uses timestamptz for PostgreSQL
       */
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
