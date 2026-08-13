import CartItem from 'App/Models/CartItem'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'

export class CartItemRepository {
  public async insert(
    data: Partial<CartItem>,
    options?: { client?: TransactionClientContract }
  ): Promise<CartItem> {
    const item = new CartItem()
    item.fill(data)
    if (options?.client) {
      item.useTransaction(options.client)
    }
    await item.save()
    return item
  }

  public async findById(id: string): Promise<CartItem | null> {
    return await CartItem.find(id)
  }

  public async findByCartId(cartId: string): Promise<CartItem[]> {
    return await CartItem.query().where('cart_id', cartId)
  }

  public async findByCartAndMenuItem(
    cartId: string,
    menuItemId: string
  ): Promise<CartItem | null> {
    return await CartItem.query()
      .where('cart_id', cartId)
      .andWhere('menu_item_id', menuItemId)
      .first()
  }

  public async updateQuantity(
    id: string,
    quantity: number,
    price: number,
    options?: { client?: TransactionClientContract }
  ): Promise<CartItem> {
    const item = await CartItem.find(id)
    if (!item) {
      throw new Error('Cart item not found')
    }
    if (options?.client) {
      item.useTransaction(options.client)
    }
    item.quantity = quantity
    item.price = price
    item.subtotal = Math.round(quantity * price * 100) / 100
    await item.save()
    return item
  }

  public async delete(id: string): Promise<void> {
    const item = await CartItem.find(id)
    if (item) {
      await item.delete()
    }
  }

  public async deleteByCartId(
    cartId: string,
    options?: { client?: TransactionClientContract }
  ): Promise<void> {
    const query = CartItem.query().where('cart_id', cartId)
    if (options?.client) {
      query.useTransaction(options.client)
    }
    await query.delete()
  }
}
