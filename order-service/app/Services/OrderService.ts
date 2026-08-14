import Database from '@ioc:Adonis/Lucid/Database'
import { OrderRepository } from 'App/Repositories/OrderRepository'
import { OrderItemRepository } from 'App/Repositories/OrderItemRepository'
import { CartRepository } from 'App/Repositories/CartRepository'
import { RestaurantClient } from 'App/Services/RestaurantClient'
import { UserClient } from 'App/Services/UserClient'
import { OrderStateService } from 'App/Services/OrderStateService'
import Order from 'App/Models/Order'
import { OrderStatus } from 'App/Constants/OrderStatus'
import { CartStatus } from 'App/Constants/CartStatus'
import { Status } from 'App/Constants/Status'
import { Roles } from 'App/Constants/Roles'
import {
  CartEmptyException,
  OrderNotFoundException,
  OrderAccessDeniedException,
  RestaurantOrderAccessDeniedException,
  BadRequestException,
} from 'App/Exceptions/CustomExceptions'

export class OrderService {
  private orderRepo = new OrderRepository()
  private orderItemRepo = new OrderItemRepository()
  private cartRepo = new CartRepository()
  private restaurantClient = new RestaurantClient()
  private userClient = new UserClient()

  private generateOrderNumber(): string {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const randomDigits = Math.floor(100000 + Math.random() * 900000)
    return `ORD-${today}-${randomDigits}`
  }

  public async checkout(
    userId: string,
    payload: { address_id?: string; delivery_address?: any },
    token?: string
  ): Promise<Order> {
    // 1. Resolve Delivery Address Snapshot
    let addressSnapshot: any = null

    if (payload.address_id) {
      // Fetch authoritative address snapshot from User Service
      addressSnapshot = await this.userClient.getUserAddress(userId, payload.address_id, token)
    } else if (payload.delivery_address) {
      addressSnapshot = payload.delivery_address
    } else {
      throw new BadRequestException('Either address_id or delivery_address snapshot must be provided for checkout')
    }

    // 2. Get active cart
    const cart = await this.cartRepo.findActiveByUserId(userId)
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new CartEmptyException()
    }
    if (!cart.restaurantId) {
      throw new CartEmptyException('Cart has no associated restaurant')
    }

    // 3. Validate restaurant with Restaurant Service
    await this.restaurantClient.getRestaurant(cart.restaurantId)

    // 4. Start PostgreSQL Transaction
    const trx = await Database.transaction()

    try {
      let calculatedTotal = 0
      const orderItemsToCreate: any[] = []

      // 5. Validate every item, capture live price and food name snapshot
      for (const cartItem of cart.items) {
        const menuItem = await this.restaurantClient.verifyMenuItemBelongsToRestaurant(
          cart.restaurantId,
          cartItem.menuItemId
        )
        await this.restaurantClient.checkMenuItemAvailability(
          cart.restaurantId,
          cartItem.menuItemId
        )

        const livePrice = Number(menuItem.price)
        const subtotal = Math.round(cartItem.quantity * livePrice * 100) / 100
        calculatedTotal += subtotal

        orderItemsToCreate.push({
          menuItemId: cartItem.menuItemId,
          name: menuItem.name,
          price: livePrice,
          quantity: cartItem.quantity,
          subtotal,
        })
      }

      calculatedTotal = Math.round(calculatedTotal * 100) / 100

      // 6. Generate Order Number & Create Order
      const orderNumber = this.generateOrderNumber()
      const order = await this.orderRepo.create(
        {
          orderNumber,
          userId,
          restaurantId: cart.restaurantId,
          deliveryAddress: addressSnapshot,
          totalAmount: calculatedTotal,
          orderStatus: OrderStatus.PENDING,
          status: Status.ENABLED,
        },
        { client: trx }
      )

      // 7. Create Order Items
      for (const itemData of orderItemsToCreate) {
        itemData.orderId = order.id
      }
      await this.orderItemRepo.insertBulk(orderItemsToCreate, { client: trx })

      // 8. Mark cart as CHECKED_OUT
      await this.cartRepo.updateStatus(cart.id, CartStatus.CHECKED_OUT, { client: trx })

      // 9. Commit Transaction
      await trx.commit()

      const resultOrder = await this.orderRepo.findById(order.id)
      return resultOrder!
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  public async getUserOrders(
    userId: string,
    options?: { page?: number; limit?: number }
  ): Promise<{ data: Order[]; meta: any }> {
    return await this.orderRepo.findByUserId(userId, options)
  }

  public async getUserOrderById(userId: string, orderId: string): Promise<Order> {
    const order = await this.orderRepo.findById(orderId)
    if (!order) {
      throw new OrderNotFoundException()
    }
    if (order.userId !== userId) {
      throw new OrderAccessDeniedException()
    }
    return order
  }

  public async cancelOrder(userId: string, orderId: string): Promise<Order> {
    const order = await this.getUserOrderById(userId, orderId)

    // Validate state transition to CANCELLED
    OrderStateService.validateTransition(order.orderStatus, OrderStatus.CANCELLED)

    return await this.orderRepo.updateOrderStatus(order.id, OrderStatus.CANCELLED)
  }

  public async getRestaurantOrders(
    userId: string,
    roles: string[],
    options?: { page?: number; limit?: number; restaurantId?: string; orderStatus?: OrderStatus }
  ): Promise<{ data: Order[]; meta: any }> {
    const isAdmin = roles.includes(Roles.ADMIN) || roles.includes(Roles.SUPER_ADMIN)

    // If specific restaurant_id is passed, verify owner control over it
    if (options?.restaurantId) {
      const restaurant = await this.restaurantClient.getRestaurant(options.restaurantId)
      if (!isAdmin && restaurant.owner_id !== userId) {
        throw new RestaurantOrderAccessDeniedException()
      }
      return await this.orderRepo.findByRestaurantId(options.restaurantId, options)
    }

    // If restaurant_id is omitted by client:
    if (isAdmin) {
      // Admins see all orders
      const page = options?.page || 1
      const limit = options?.limit || 20
      const query = Order.query().where('status', '!=', Status.DELETED)
      if (options?.orderStatus) {
        query.andWhere('order_status', options.orderStatus)
      }
      query.preload('items').orderBy('created_at', 'desc')
      const paginated = await query.paginate(page, limit)
      const json = paginated.toJSON()
      return { data: json.data as Order[], meta: json.meta }
    }

    // For RESTAURANT_OWNER: find all restaurants owned by this user
    const ownedRestaurants = await this.restaurantClient.getOwnerRestaurants(userId)
    const ownedIds = ownedRestaurants.map((r) => r.id || r.restaurant_id)

    if (ownedIds.length === 0) {
      return {
        data: [],
        meta: { page: options?.page || 1, limit: options?.limit || 20, total: 0 },
      }
    }

    const page = options?.page || 1
    const limit = options?.limit || 20
    const query = Order.query()
      .whereIn('restaurant_id', ownedIds)
      .andWhere('status', '!=', Status.DELETED)

    if (options?.orderStatus) {
      query.andWhere('order_status', options.orderStatus)
    }

    query.preload('items').orderBy('created_at', 'desc')
    const paginated = await query.paginate(page, limit)
    const json = paginated.toJSON()

    return { data: json.data as Order[], meta: json.meta }
  }

  public async getRestaurantOrderById(
    userId: string,
    roles: string[],
    orderId: string
  ): Promise<Order> {
    const order = await this.orderRepo.findById(orderId)
    if (!order) {
      throw new OrderNotFoundException()
    }

    const restaurant = await this.restaurantClient.getRestaurant(order.restaurantId)
    const isAdmin = roles.includes(Roles.ADMIN) || roles.includes(Roles.SUPER_ADMIN)

    if (!isAdmin && restaurant.owner_id !== userId) {
      throw new RestaurantOrderAccessDeniedException()
    }

    return order
  }

  public async updateRestaurantOrderStatus(
    userId: string,
    roles: string[],
    orderId: string,
    targetStatus: OrderStatus
  ): Promise<Order> {
    const order = await this.getRestaurantOrderById(userId, roles, orderId)

    // Validate state transition
    OrderStateService.validateTransition(order.orderStatus, targetStatus)

    return await this.orderRepo.updateOrderStatus(order.id, targetStatus)
  }
}
