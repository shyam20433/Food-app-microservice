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
const MenuItem_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/MenuItem"));
const Status_1 = global[Symbol.for('ioc.use')]("App/Constants/Status");
class Category extends Orm_1.BaseModel {
    static assignUuid(category) {
        if (!category.id) {
            category.id = (0, uuid_1.v4)();
        }
    }
}
Category.table = 'categories';
__decorate([
    (0, Orm_1.column)({ isPrimary: true }),
    __metadata("design:type", String)
], Category.prototype, "id", void 0);
__decorate([
    (0, Orm_1.column)({ columnName: 'restaurant_id' }),
    __metadata("design:type", String)
], Category.prototype, "restaurantId", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", String)
], Category.prototype, "name", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", Object)
], Category.prototype, "description", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", String)
], Category.prototype, "status", void 0);
__decorate([
    Orm_1.column.dateTime({ autoCreate: true }),
    __metadata("design:type", luxon_1.DateTime)
], Category.prototype, "createdAt", void 0);
__decorate([
    Orm_1.column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", luxon_1.DateTime)
], Category.prototype, "updatedAt", void 0);
__decorate([
    (0, Orm_1.belongsTo)(() => Restaurant_1.default, {
        foreignKey: 'restaurantId',
    }),
    __metadata("design:type", Object)
], Category.prototype, "restaurant", void 0);
__decorate([
    (0, Orm_1.hasMany)(() => MenuItem_1.default, {
        foreignKey: 'categoryId',
    }),
    __metadata("design:type", Object)
], Category.prototype, "menuItems", void 0);
__decorate([
    (0, Orm_1.beforeCreate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Category]),
    __metadata("design:returntype", void 0)
], Category, "assignUuid", null);
exports.default = Category;
//# sourceMappingURL=Category.js.map