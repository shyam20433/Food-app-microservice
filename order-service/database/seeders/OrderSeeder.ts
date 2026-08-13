import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Cart from 'App/Models/Cart'
import CartItem from 'App/Models/CartItem'
import Order from 'App/Models/Order'
import OrderItem from 'App/Models/OrderItem'
import { CartStatus } from 'App/Constants/CartStatus'
import { OrderStatus } from 'App/Constants/OrderStatus'
import { Status } from 'App/Constants/Status'

export default class OrderSeeder extends BaseSeeder {
  public async run() {
    // Unique seed data check
    const existingOrder = await Order.findBy('order_number', 'ORD-20260813-000001')
    if (existingOrder) {
      return
    }

    const sampleUserId = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
    const sampleRestaurantId = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
    const sampleMenuItemId1 = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
    const sampleMenuItemId2 = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'

    // 1. Seed Sample Active Cart
    const cart = await Cart.create({
      userId: sampleUserId,
      restaurantId: sampleRestaurantId,
      status: CartStatus.ACTIVE,
    })

    await CartItem.create({
      cartId: cart.id,
      menuItemId: sampleMenuItemId1,
      quantity: 2,
      price: 14.99,
      subtotal: 29.98,
    })

    // 2. Seed Sample Order
    const order = await Order.create({
      orderNumber: 'ORD-20260813-000001',
      userId: sampleUserId,
      restaurantId: sampleRestaurantId,
      deliveryAddress: {
        label: 'Home',
        house_no: '24',
        street: 'Avinashi Road',
        area: 'Peelamedu',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pincode: '641004',
        latitude: 11.0168,
        longitude: 76.9558,
      },
      totalAmount: 38.98,
      orderStatus: OrderStatus.PENDING,
      status: Status.ENABLED,
    })

    await OrderItem.createMany([
      {
        orderId: order.id,
        menuItemId: sampleMenuItemId1,
        name: 'Margherita Classic Pizza',
        price: 14.99,
        quantity: 2,
        subtotal: 29.98,
      },
      {
        orderId: order.id,
        menuItemId: sampleMenuItemId2,
        name: 'Garlic Breadsticks',
        price: 9.0,
        quantity: 1,
        subtotal: 9.0,
      },
    ])
  }
}
