import Schema from '@ioc:Adonis/Lucid/Schema'
import { RefreshTokenStatus } from 'App/Constants/Status'

export default class RefreshTokens extends Schema {
  protected tableName = 'refresh_tokens'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable()
      table.text('token_hash').notNullable().unique()
      table.timestamp('expires_at', { useTz: true }).notNullable()
      table.enum('status', Object.values(RefreshTokenStatus)).defaultTo(RefreshTokenStatus.ACTIVE)

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
