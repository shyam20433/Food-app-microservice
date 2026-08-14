import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'payments'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('order_id').notNullable().index()
      table.uuid('user_id').notNullable().index()
      table.decimal('amount', 10, 2).notNullable()
      table.string('currency', 10).notNullable().defaultTo('INR')
      table.string('status', 50).notNullable().defaultTo('CREATED').index()
      table.string('gateway', 50).notNullable().defaultTo('MOCK')
      table.string('gateway_payment_id', 255).nullable().index()

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
