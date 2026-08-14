import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'idempotency_keys'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.string('key', 255).notNullable()
      table.uuid('user_id').notNullable().index()
      table.string('operation', 100).notNullable()
      table.string('request_hash', 255).notNullable()
      table.jsonb('response').nullable()
      table.timestamp('expires_at', { useTz: true }).notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      table.unique(['key', 'operation'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
