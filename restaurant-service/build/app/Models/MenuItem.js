"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const luxon_1 = require("luxon");
const Orm_1 = global[Symbol.for('ioc.use')]("Adonis/Lucid/Orm");
const uuid_1 = require("uuid");
const Restaurant_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Restaurant"));
const Category_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Category"));
const Status_1 = global[Symbol.for('ioc.use')]("App/Constants/Status");
class MenuItem extends Orm_1.BaseModel {
    static assignUuid(menuItem) {
        if (!menuItem.id) {
            menuItem.id = (0, uuid_1.v4)();
        }
    }
}
MenuItem.table = 'menu_items';
__decorate([
    (0, Orm_1.column)({ isPrimary: true }),
    __metadata("design:type", String)
], MenuItem.prototype, "id", void 0);
__decorate([
    (0, Orm_1.column)({ columnName: 'restaurant_id' }),
    __metadata("design:type", String)
], MenuItem.prototype, "restaurantId", void 0);
__decorate([
    (0, Orm_1.column)({ columnName: 'category_id' }),
    __metadata("design:type", String)
], MenuItem.prototype, "categoryId", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", String)
], MenuItem.prototype, "name", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", Object)
], MenuItem.prototype, "description", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", Number)
], MenuItem.prototype, "price", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", Object)
], MenuItem.prototype, "image", void 0);
__decorate([
    (0, Orm_1.column)({ columnName: 'is_vegetarian' }),
    __metadata("design:type", Boolean)
], MenuItem.prototype, "isVegetarian", void 0);
__decorate([
    (0, Orm_1.column)({ columnName: 'preparation_time' }),
    __metadata("design:type", Number)
], MenuItem.prototype, "preparationTime", void 0);
__decorate([
    (0, Orm_1.column)({ columnName: 'is_available' }),
    __metadata("design:type", Boolean)
], MenuItem.prototype, "isAvailable", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", String)
], MenuItem.prototype, "status", void 0);
__decorate([
    Orm_1.column.dateTime({ autoCreate: true }),
    __metadata("design:type", luxon_1.DateTime)
], MenuItem.prototype, "createdAt", void 0);
__decorate([
    Orm_1.column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", luxon_1.DateTime)
], MenuItem.prototype, "updatedAt", void 0);
__decorate([
    (0, Orm_1.belongsTo)(() => Restaurant_1.default, {
        foreignKey: 'restaurantId',
    }),
    __metadata("design:type", Object)
], MenuItem.prototype, "restaurant", void 0);
__decorate([
    (0, Orm_1.belongsTo)(() => Category_1.default, {
        foreignKey: 'categoryId',
    }),
    __metadata("design:type", Object)
], MenuItem.prototype, "category", void 0);
__decorate([
    (0, Orm_1.beforeCreate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [MenuItem]),
    __metadata("design:returntype", void 0)
], MenuItem, "assignUuid", null);
exports.default = MenuItem;
//# sourceMappingURL=MenuItem.js.map