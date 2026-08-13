import Cart from 'App/Models/Cart'
import { CartStatus } from 'App/Constants/CartStatus'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import { CartNotFoundException } from 'App/Exceptions/CustomExceptions'

export class CartRepository {
  public async create(
    data: Partial<Cart>,
    options?: { client?: TransactionClientContract }
  ): Promise<Cart> {
    const cart = new Cart()
    cart.fill(data)
    if (options?.client) {
      cart.useTransaction(options.client)
    }
    await cart.save()
    return cart
  }

  public async findActiveByUserId(userId: string): Promise<Cart | null> {
    return await Cart.query()
      .where('user_id', userId)
      .andWhere('status', CartStatus.ACTIVE)
      .preload('items')
      .first()
  }

  public async findById(id: string): Promise<Cart | null> {
    return await Cart.query().where('id', id).preload('items').first()
  }

  public async updateStatus(
    id: string,
    status: CartStatus,
    options?: { client?: TransactionClientContract }
  ): Promise<Cart> {
    const cart = await Cart.find(id)
    if (!cart) {
      throw new CartNotFoundException()
    }
    if (options?.client) {
      cart.useTransaction(options.client)
    }
    cart.status = status
    await cart.save()
    return cart
  }

  public async updateRestaurantId(
    id: string,
    restaurantId: string | null,
    options?: { client?: TransactionClientContract }
  ): Promise<Cart> {
    const cart = await Cart.find(id)
    if (!cart) {
      throw new CartNotFoundException()
    }
    if (options?.client) {
      cart.useTransaction(options.client)
    }
    cart.restaurantId = restaurantId
    await cart.save()
    return cart
  }
}
