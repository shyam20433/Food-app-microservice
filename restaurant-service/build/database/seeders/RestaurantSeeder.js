"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Seeder_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Seeder"));
const Restaurant_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Restaurant"));
const RestaurantAddress_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/RestaurantAddress"));
const Category_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/Category"));
const MenuItem_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Models/MenuItem"));
const Status_1 = global[Symbol.for('ioc.use')]("App/Constants/Status");
class RestaurantSeeder extends Seeder_1.default {
    async run() {
        const r1 = await Restaurant_1.default.create({
            ownerId: '11111111-1111-1111-1111-111111111111',
            name: 'Tasty Bites Pizza & Burger',
            description: 'Delicious Italian pizza and gourmet burgers.',
            phoneNumber: '+15550001111',
            email: 'contact@tastybites.com',
            logo: 'https://example.com/logo1.png',
            openingTime: '09:00:00',
            closingTime: '23:00:00',
            deliveryRadius: 10.0,
            status: Status_1.RestaurantStatus.ENABLED,
        });
        await RestaurantAddress_1.default.create({
            restaurantId: r1.id,
            houseNo: '12B',
            street: 'Food Court Avenue',
            area: 'Downtown',
            city: 'Metropolis',
            state: 'NY',
            pincode: '10001',
            latitude: 40.7128,
            longitude: -74.006,
            status: Status_1.AddressStatus.ENABLED,
        });
        const catPizza = await Category_1.default.create({
            restaurantId: r1.id,
            name: 'Pizza',
            description: 'Wood-fired sourdough pizzas',
            status: Status_1.CategoryStatus.ENABLED,
        });
        const catBurgers = await Category_1.default.create({
            restaurantId: r1.id,
            name: 'Burgers',
            description: 'Juicy burgers with crispy fries',
            status: Status_1.CategoryStatus.ENABLED,
        });
        await MenuItem_1.default.create({
            restaurantId: r1.id,
            categoryId: catPizza.id,
            name: 'Margherita Classic',
            description: 'Fresh mozzarella, basil, tomato sauce',
            price: 14.99,
            isVegetarian: true,
            preparationTime: 20,
            isAvailable: true,
            status: Status_1.MenuItemStatus.ENABLED,
        });
        await MenuItem_1.default.create({
            restaurantId: r1.id,
            categoryId: catBurgers.id,
            name: 'Smokey BBQ Cheeseburger',
            description: 'Angus beef patty, cheddar, bacon, BBQ sauce',
            price: 12.50,
            isVegetarian: false,
            preparationTime: 15,
            isAvailable: true,
            status: Status_1.MenuItemStatus.ENABLED,
        });
        const r2 = await Restaurant_1.default.create({
            ownerId: '22222222-2222-2222-2222-222222222222',
            name: 'Spice Route Biryani & Curry',
            description: 'Authentic Indian biryanis and rich curries.',
            phoneNumber: '+15550002222',
            email: 'info@spiceroute.com',
            logo: 'https://example.com/logo2.png',
            openingTime: '11:00:00',
            closingTime: '22:30:00',
            deliveryRadius: 8.5,
            status: Status_1.RestaurantStatus.ENABLED,
        });
        await RestaurantAddress_1.default.create({
            restaurantId: r2.id,
            houseNo: '55/A',
            street: 'Spice Market Lane',
            area: 'Little India',
            city: 'Metropolis',
            state: 'NY',
            pincode: '10002',
            latitude: 40.7150,
            longitude: -74.002,
            status: Status_1.AddressStatus.ENABLED,
        });
        const catBiryani = await Category_1.default.create({
            restaurantId: r2.id,
            name: 'Biryani',
            description: 'Aromatic Dum Biryani',
            status: Status_1.CategoryStatus.ENABLED,
        });
        await MenuItem_1.default.create({
            restaurantId: r2.id,
            categoryId: catBiryani.id,
            name: 'Hyderabadi Chicken Biryani',
            description: 'Slow cooked tender chicken with basmati rice',
            price: 16.00,
            isVegetarian: false,
            preparationTime: 25,
            isAvailable: true,
            status: Status_1.MenuItemStatus.ENABLED,
        });
    }
}
exports.default = RestaurantSeeder;
//# sourceMappingURL=RestaurantSeeder.js.map