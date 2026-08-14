import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'refunds'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table
        .uuid('payment_id')
        .notNullable()
        .references('id')
        .inTable('payments')
        .onDelete('CASCADE')
        .index()
      table.decimal('amount', 10, 2).notNullable()
      table.string('status', 50).notNullable().defaultTo('PENDING')
      table.string('gateway_refund_id', 255).nullable()
      table.text('reason').nullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
