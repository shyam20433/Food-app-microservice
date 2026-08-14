import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'delivery_status_history'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table
        .uuid('delivery_id')
        .notNullable()
        .references('id')
        .inTable('deliveries')
        .onDelete('CASCADE')
      table.string('status').notNullable()
      table.uuid('changed_by').notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
