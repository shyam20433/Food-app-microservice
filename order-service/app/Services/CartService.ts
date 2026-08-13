import { CartRepository } from 'App/Repositories/CartRepository'
import { CartItemRepository } from 'App/Repositories/CartItemRepository'
import { RestaurantClient } from 'App/Services/RestaurantClient'
import Cart from 'App/Models/Cart'
import { CartStatus } from 'App/Constants/CartStatus'
import {
  CartNotFoundException,
  CartRestaurantMismatchException,
  BadRequestException,
} from 'App/Exceptions/CustomExceptions'

export class CartService {
  private cartRepo = new CartRepository()
  private cartItemRepo = new CartItemRepository()
  private restaurantClient = new RestaurantClient()

  public async getCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepo.findActiveByUserId(userId)
    if (!cart) {
      cart = await this.cartRepo.create({
        userId,
        restaurantId: null,
        status: CartStatus.ACTIVE,
      })
      await cart.load('items')
    }
    return cart
  }

  public async addItem(
    userId: string,
    payload: { restaurant_id: string; menu_item_id: string; quantity: number }
  ): Promise<Cart> {
    if (!payload.quantity || payload.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0')
    }

    // 1. Verify restaurant and menu item with Restaurant Service
    await this.restaurantClient.getRestaurant(payload.restaurant_id)
    const menuItem = await this.restaurantClient.verifyMenuItemBelongsToRestaurant(
      payload.restaurant_id,
      payload.menu_item_id
    )
    await this.restaurantClient.checkMenuItemAvailability(
      payload.restaurant_id,
      payload.menu_item_id
    )

    // 2. Fetch server-side calculated price
    const currentPrice = Number(menuItem.price)

    // 3. Find or create active cart for user
    let cart = await this.cartRepo.findActiveByUserId(userId)
    if (!cart) {
      cart = await this.cartRepo.create({
        userId,
        restaurantId: payload.restaurant_id,
        status: CartStatus.ACTIVE,
      })
    } else {
      // 4. Restaurant Consistency Enforcement
      if (cart.items.length === 0) {
        // Empty cart can adopt new restaurant_id
        await this.cartRepo.updateRestaurantId(cart.id, payload.restaurant_id)
        cart.restaurantId = payload.restaurant_id
      } else if (cart.restaurantId && cart.restaurantId !== payload.restaurant_id) {
        throw new CartRestaurantMismatchException()
      }
    }

    // 5. Add or update item in cart
    const existingItem = await this.cartItemRepo.findByCartAndMenuItem(cart.id, payload.menu_item_id)
    if (existingItem) {
      const newQuantity = existingItem.quantity + payload.quantity
      await this.cartItemRepo.updateQuantity(existingItem.id, newQuantity, currentPrice)
    } else {
      const subtotal = Math.round(payload.quantity * currentPrice * 100) / 100
      await this.cartItemRepo.insert({
        cartId: cart.id,
        menuItemId: payload.menu_item_id,
        quantity: payload.quantity,
        price: currentPrice,
        subtotal,
      })
    }

    return await this.getCart(userId)
  }

  public async updateItemQuantity(
    userId: string,
    cartItemId: string,
    quantity: number
  ): Promise<Cart> {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0. Use DELETE to remove item.')
    }

    const cart = await this.cartRepo.findActiveByUserId(userId)
    if (!cart) {
      throw new CartNotFoundException()
    }

    const cartItem = await this.cartItemRepo.findById(cartItemId)
    if (!cartItem || cartItem.cartId !== cart.id) {
      throw new BadRequestException('Cart item does not belong to your active cart')
    }

    // Refresh price from Restaurant Service if possible
    let currentPrice = cartItem.price
    if (cart.restaurantId) {
      try {
        currentPrice = await this.restaurantClient.getMenuItemPrice(
          cart.restaurantId,
          cartItem.menuItemId
        )
      } catch {
        // Fallback to captured price if remote call fails during quantity update
      }
    }

    await this.cartItemRepo.updateQuantity(cartItem.id, quantity, currentPrice)
    return await this.getCart(userId)
  }

  public async removeItem(userId: string, cartItemId: string): Promise<Cart> {
    const cart = await this.cartRepo.findActiveByUserId(userId)
    if (!cart) {
      throw new CartNotFoundException()
    }

    const cartItem = await this.cartItemRepo.findById(cartItemId)
    if (!cartItem || cartItem.cartId !== cart.id) {
      throw new BadRequestException('Cart item does not belong to your active cart')
    }

    await this.cartItemRepo.delete(cartItemId)

    // If cart is now empty, reset restaurantId to null
    const updatedCart = await this.getCart(userId)
    if (updatedCart.items.length === 0) {
      await this.cartRepo.updateRestaurantId(cart.id, null)
      updatedCart.restaurantId = null
    }

    return updatedCart
  }

  public async clearCart(userId: string): Promise<Cart> {
    const cart = await this.cartRepo.findActiveByUserId(userId)
    if (!cart) {
      throw new CartNotFoundException()
    }

    await this.cartItemRepo.deleteByCartId(cart.id)
    await this.cartRepo.updateRestaurantId(cart.id, null)
    return await this.getCart(userId)
  }
}
