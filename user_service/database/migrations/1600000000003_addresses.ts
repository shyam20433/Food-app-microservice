import Schema from '@ioc:Adonis/Lucid/Schema'

export default class Addresses extends Schema {
  protected tableName = 'addresses'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable()
      table.string('label', 30).nullable()
      table.string('house_no', 100).nullable()
      table.string('street', 255).nullable()
      table.string('area', 255).nullable()
      table.string('city', 100).nullable()
      table.string('state', 100).nullable()
      table.string('pincode', 10).nullable()
      table.boolean('is_default').defaultTo(false)
      table.enum('status', ['ENABLED', 'DELETED']).defaultTo('ENABLED')

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
