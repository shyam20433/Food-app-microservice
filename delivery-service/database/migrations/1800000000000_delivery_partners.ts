import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'delivery_partners'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('user_id').notNullable().unique()
      table.string('vehicle_type').notNullable()
      table.string('vehicle_number').notNullable()
      table.decimal('latitude', 10, 6).notNullable().defaultTo(0.0)
      table.decimal('longitude', 10, 6).notNullable().defaultTo(0.0)
      table.string('availability_status').notNullable().defaultTo('OFFLINE')
      table.string('status').notNullable().defaultTo('ENABLED')

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
