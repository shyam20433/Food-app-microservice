import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'deliveries'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('order_id').notNullable().index()
      table.uuid('restaurant_id').notNullable().index()
      table
        .uuid('delivery_partner_id')
        .nullable()
        .references('id')
        .inTable('delivery_partners')
        .onDelete('SET NULL')

      table.jsonb('pickup_address').notNullable()
      table.jsonb('delivery_address').notNullable()
      table.string('status').notNullable().defaultTo('ASSIGNING')

      table.timestamp('assigned_at', { useTz: true }).nullable()
      table.timestamp('picked_up_at', { useTz: true }).nullable()
      table.timestamp('delivered_at', { useTz: true }).nullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
