import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Restaurant from 'App/Models/Restaurant'
import RestaurantAddress from 'App/Models/RestaurantAddress'
import Category from 'App/Models/Category'
import MenuItem from 'App/Models/MenuItem'
import { RestaurantStatus, AddressStatus, CategoryStatus, MenuItemStatus } from 'App/Constants/Status'

export default class RestaurantSeeder extends BaseSeeder {
  public async run() {
    // Create Sample Restaurant 1
    const r1 = await Restaurant.create({
      ownerId: '11111111-1111-1111-1111-111111111111',
      name: 'Tasty Bites Pizza & Burger',
      description: 'Delicious Italian pizza and gourmet burgers.',
      phoneNumber: '+15550001111',
      email: 'contact@tastybites.com',
      logo: 'https://example.com/logo1.png',
      openingTime: '09:00:00',
      closingTime: '23:00:00',
      deliveryRadius: 10.0,
      status: RestaurantStatus.ENABLED,
    })

    await RestaurantAddress.create({
      restaurantId: r1.id,
      houseNo: '12B',
      street: 'Food Court Avenue',
      area: 'Downtown',
      city: 'Metropolis',
      state: 'NY',
      pincode: '10001',
      latitude: 40.7128,
      longitude: -74.006,
      status: AddressStatus.ENABLED,
    })

    const catPizza = await Category.create({
      restaurantId: r1.id,
      name: 'Pizza',
      description: 'Wood-fired sourdough pizzas',
      status: CategoryStatus.ENABLED,
    })

    const catBurgers = await Category.create({
      restaurantId: r1.id,
      name: 'Burgers',
      description: 'Juicy burgers with crispy fries',
      status: CategoryStatus.ENABLED,
    })

    await MenuItem.create({
      restaurantId: r1.id,
      categoryId: catPizza.id,
      name: 'Margherita Classic',
      description: 'Fresh mozzarella, basil, tomato sauce',
      price: 14.99,
      isVegetarian: true,
      preparationTime: 20,
      isAvailable: true,
      status: MenuItemStatus.ENABLED,
    })

    await MenuItem.create({
      restaurantId: r1.id,
      categoryId: catBurgers.id,
      name: 'Smokey BBQ Cheeseburger',
      description: 'Angus beef patty, cheddar, bacon, BBQ sauce',
      price: 12.50,
      isVegetarian: false,
      preparationTime: 15,
      isAvailable: true,
      status: MenuItemStatus.ENABLED,
    })

    // Create Sample Restaurant 2
    const r2 = await Restaurant.create({
      ownerId: '22222222-2222-2222-2222-222222222222',
      name: 'Spice Route Biryani & Curry',
      description: 'Authentic Indian biryanis and rich curries.',
      phoneNumber: '+15550002222',
      email: 'info@spiceroute.com',
      logo: 'https://example.com/logo2.png',
      openingTime: '11:00:00',
      closingTime: '22:30:00',
      deliveryRadius: 8.5,
      status: RestaurantStatus.ENABLED,
    })

    await RestaurantAddress.create({
      restaurantId: r2.id,
      houseNo: '55/A',
      street: 'Spice Market Lane',
      area: 'Little India',
      city: 'Metropolis',
      state: 'NY',
      pincode: '10002',
      latitude: 40.7150,
      longitude: -74.002,
      status: AddressStatus.ENABLED,
    })

    const catBiryani = await Category.create({
      restaurantId: r2.id,
      name: 'Biryani',
      description: 'Aromatic Dum Biryani',
      status: CategoryStatus.ENABLED,
    })

    await MenuItem.create({
      restaurantId: r2.id,
      categoryId: catBiryani.id,
      name: 'Hyderabadi Chicken Biryani',
      description: 'Slow cooked tender chicken with basmati rice',
      price: 16.00,
      isVegetarian: false,
      preparationTime: 25,
      isAvailable: true,
      status: MenuItemStatus.ENABLED,
    })
  }
}
