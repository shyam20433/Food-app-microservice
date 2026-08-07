import Schema from '@ioc:Adonis/Lucid/Schema'

export default class Users extends Schema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.string('name', 150).notNullable()
      table.string('email', 255).notNullable().unique()
      table.string('phone_number', 15).notNullable().unique()
      table.text('password').notNullable()
      table.text('profile_image').nullable()
      table.enum('status', ['ENABLED', 'DISABLED', 'DELETED']).defaultTo('ENABLED')
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
