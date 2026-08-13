"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Schema_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Schema"));
class MenuItemsSchema extends Schema_1.default {
    constructor() {
        super(...arguments);
        this.tableName = 'menu_items';
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
            table
                .uuid('category_id')
                .notNullable()
                .references('id')
                .inTable('categories')
                .onDelete('CASCADE')
                .index();
            table.string('name', 255).notNullable();
            table.text('description').nullable();
            table.decimal('price', 10, 2).notNullable();
            table.string('image', 500).nullable();
            table.boolean('is_vegetarian').notNullable().defaultTo(false);
            table.integer('preparation_time').notNullable().defaultTo(15);
            table.boolean('is_available').notNullable().defaultTo(true);
            table.string('status', 20).notNullable().defaultTo('ENABLED').index();
            table.timestamp('created_at', { useTz: true }).notNullable();
            table.timestamp('updated_at', { useTz: true }).notNullable();
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
exports.default = MenuItemsSchema;
//# sourceMappingURL=1000000000004_menu_items.js.map