import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'webhook_events'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.string('gateway', 50).notNullable()
      table.string('event_id', 255).notNullable()
      table.string('event_type', 100).notNullable()
      table.jsonb('payload').notNullable()
      table.string('status', 50).notNullable().defaultTo('RECEIVED')
      table.timestamp('processed_at', { useTz: true }).nullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      table.unique(['gateway', 'event_id'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
