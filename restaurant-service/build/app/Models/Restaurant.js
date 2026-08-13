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
const RestaurantAddress_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/RestaurantAddress"));
const Category_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Category"));
const MenuItem_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/MenuItem"));
const Status_1 = global[Symbol.for('ioc.use')]("App/Constants/Status");
class Restaurant extends Orm_1.BaseModel {
    static assignUuid(restaurant) {
        if (!restaurant.id) {
            restaurant.id = (0, uuid_1.v4)();
        }
    }
}
__decorate([
    (0, Orm_1.column)({ isPrimary: true }),
    __metadata("design:type", String)
], Restaurant.prototype, "id", void 0);
__decorate([
    (0, Orm_1.column)({ columnName: 'owner_id' }),
    __metadata("design:type", String)
], Restaurant.prototype, "ownerId", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", String)
], Restaurant.prototype, "name", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", Object)
], Restaurant.prototype, "description", void 0);
__decorate([
    (0, Orm_1.column)({ columnName: 'phone_number' }),
    __metadata("design:type", String)
], Restaurant.prototype, "phoneNumber", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", String)
], Restaurant.prototype, "email", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", Object)
], Restaurant.prototype, "logo", void 0);
__decorate([
    (0, Orm_1.column)({ columnName: 'opening_time' }),
    __metadata("design:type", Object)
], Restaurant.prototype, "openingTime", void 0);
__decorate([
    (0, Orm_1.column)({ columnName: 'closing_time' }),
    __metadata("design:type", Object)
], Restaurant.prototype, "closingTime", void 0);
__decorate([
    (0, Orm_1.column)({ columnName: 'delivery_radius' }),
    __metadata("design:type", Number)
], Restaurant.prototype, "deliveryRadius", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", String)
], Restaurant.prototype, "status", void 0);
__decorate([
    Orm_1.column.dateTime({ autoCreate: true }),
    __metadata("design:type", luxon_1.DateTime)
], Restaurant.prototype, "createdAt", void 0);
__decorate([
    Orm_1.column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", luxon_1.DateTime)
], Restaurant.prototype, "updatedAt", void 0);
__decorate([
    (0, Orm_1.hasOne)(() => RestaurantAddress_1.default, {
        foreignKey: 'restaurantId',
    }),
    __metadata("design:type", Object)
], Restaurant.prototype, "address", void 0);
__decorate([
    (0, Orm_1.hasMany)(() => Category_1.default, {
        foreignKey: 'restaurantId',
    }),
    __metadata("design:type", Object)
], Restaurant.prototype, "categories", void 0);
__decorate([
    (0, Orm_1.hasMany)(() => MenuItem_1.default, {
        foreignKey: 'restaurantId',
    }),
    __metadata("design:type", Object)
], Restaurant.prototype, "menuItems", void 0);
__decorate([
    (0, Orm_1.beforeCreate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Restaurant]),
    __metadata("design:returntype", void 0)
], Restaurant, "assignUuid", null);
exports.default = Restaurant;
//# sourceMappingURL=Restaurant.js.map