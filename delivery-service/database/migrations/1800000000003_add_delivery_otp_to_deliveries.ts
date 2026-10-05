import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'deliveries'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('delivery_otp', 4).nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('delivery_otp')
    })
  }
}
