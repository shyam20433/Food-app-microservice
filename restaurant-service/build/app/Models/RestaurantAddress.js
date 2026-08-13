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
const Status_1 = global[Symbol.for('ioc.use')]("App/Constants/Status");
class RestaurantAddress extends Orm_1.BaseModel {
    static assignUuid(address) {
        if (!address.id) {
            address.id = (0, uuid_1.v4)();
        }
    }
}
RestaurantAddress.table = 'restaurant_addresses';
__decorate([
    (0, Orm_1.column)({ isPrimary: true }),
    __metadata("design:type", String)
], RestaurantAddress.prototype, "id", void 0);
__decorate([
    (0, Orm_1.column)({ columnName: 'restaurant_id' }),
    __metadata("design:type", String)
], RestaurantAddress.prototype, "restaurantId", void 0);
__decorate([
    (0, Orm_1.column)({ columnName: 'house_no' }),
    __metadata("design:type", String)
], RestaurantAddress.prototype, "houseNo", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", String)
], RestaurantAddress.prototype, "street", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", Object)
], RestaurantAddress.prototype, "area", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", String)
], RestaurantAddress.prototype, "city", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", String)
], RestaurantAddress.prototype, "state", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", String)
], RestaurantAddress.prototype, "pincode", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", Object)
], RestaurantAddress.prototype, "latitude", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", Object)
], RestaurantAddress.prototype, "longitude", void 0);
__decorate([
    (0, Orm_1.column)(),
    __metadata("design:type", String)
], RestaurantAddress.prototype, "status", void 0);
__decorate([
    Orm_1.column.dateTime({ autoCreate: true }),
    __metadata("design:type", luxon_1.DateTime)
], RestaurantAddress.prototype, "createdAt", void 0);
__decorate([
    Orm_1.column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", luxon_1.DateTime)
], RestaurantAddress.prototype, "updatedAt", void 0);
__decorate([
    (0, Orm_1.belongsTo)(() => Restaurant_1.default, {
        foreignKey: 'restaurantId',
    }),
    __metadata("design:type", Object)
], RestaurantAddress.prototype, "restaurant", void 0);
__decorate([
    (0, Orm_1.beforeCreate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RestaurantAddress]),
    __metadata("design:returntype", void 0)
], RestaurantAddress, "assignUuid", null);
exports.default = RestaurantAddress;
//# sourceMappingURL=RestaurantAddress.js.map