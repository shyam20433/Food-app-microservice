"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Schema_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Schema"));
class RestaurantAddressesSchema extends Schema_1.default {
    constructor() {
        super(...arguments);
        this.tableName = 'restaurant_addresses';
    }
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary();
            table
                .uuid('restaurant_id')
                .notNullable()
                .references('id')
                .inTable('restaurants')
                .onDelete('CASCADE')
                .index();
            table.string('house_no', 100).notNullable();
            table.string('street', 255).notNullable();
            table.string('area', 255).nullable();
            table.string('city', 100).notNullable();
            table.string('state', 100).notNullable();
            table.string('pincode', 20).notNullable();
            table.decimal('latitude', 10, 8).nullable();
            table.decimal('longitude', 11, 8).nullable();
            table.string('status', 20).notNullable().defaultTo('ENABLED').index();
            table.timestamp('created_at', { useTz: true }).notNullable();
            table.timestamp('updated_at', { useTz: true }).notNullable();
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
exports.default = RestaurantAddressesSchema;
//# sourceMappingURL=1000000000002_restaurant_addresses.js.map