"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Schema_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Schema"));
class RestaurantsSchema extends Schema_1.default {
    constructor() {
        super(...arguments);
        this.tableName = 'restaurants';
    }
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary();
            table.uuid('owner_id').notNullable().index();
            table.string('name', 255).notNullable();
            table.text('description').nullable();
            table.string('phone_number', 50).notNullable();
            table.string('email', 255).notNullable();
            table.string('logo', 500).nullable();
            table.string('opening_time', 20).nullable();
            table.string('closing_time', 20).nullable();
            table.decimal('delivery_radius', 8, 2).notNullable().defaultTo(5.00);
            table.string('status', 20).notNullable().defaultTo('ENABLED').index();
            table.timestamp('created_at', { useTz: true }).notNullable();
            table.timestamp('updated_at', { useTz: true }).notNullable();
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
exports.default = RestaurantsSchema;
//# sourceMappingURL=1000000000001_restaurants.js.map