"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Schema_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Schema"));
class CategoriesSchema extends Schema_1.default {
    constructor() {
        super(...arguments);
        this.tableName = 'categories';
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
            table.string('name', 255).notNullable();
            table.text('description').nullable();
            table.string('status', 20).notNullable().defaultTo('ENABLED').index();
            table.timestamp('created_at', { useTz: true }).notNullable();
            table.timestamp('updated_at', { useTz: true }).notNullable();
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
exports.default = CategoriesSchema;
//# sourceMappingURL=1000000000003_categories.js.map