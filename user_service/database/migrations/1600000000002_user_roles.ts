import Schema from '@ioc:Adonis/Lucid/Schema'

export default class UserRoles extends Schema {
  protected tableName = 'user_roles'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable()
      table
        .string('role_name', 50)
        .references('name')
        .inTable('roles')
        .onDelete('CASCADE')
        .notNullable()

      table.primary(['user_id', 'role_name'])

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
