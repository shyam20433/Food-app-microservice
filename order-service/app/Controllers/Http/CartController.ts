import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { CartService } from 'App/Services/CartService'
import { ApiResponse } from 'App/Response/ApiResponse'
import CreateCartItemValidator from 'App/Validators/CreateCartItemValidator'
import UpdateCartItemValidator from 'App/Validators/UpdateCartItemValidator'

export default class CartController {
  private cartService = new CartService()

  public async index(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const cart = await this.cartService.getCart(user.id)
    return ApiResponse.success(ctx, cart, 'Active cart retrieved successfully')
  }

  public async addItem(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const payload = await ctx.request.validate(CreateCartItemValidator)

    const cart = await this.cartService.addItem(user.id, payload)
    return ApiResponse.success(ctx, cart, 'Item added to cart successfully')
  }

  public async updateItem(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const cartItemId = ctx.params.id
    const payload = await ctx.request.validate(UpdateCartItemValidator)

    const cart = await this.cartService.updateItemQuantity(user.id, cartItemId, payload.quantity)
    return ApiResponse.success(ctx, cart, 'Cart item quantity updated successfully')
  }

  public async removeItem(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const cartItemId = ctx.params.id

    const cart = await this.cartService.removeItem(user.id, cartItemId)
    return ApiResponse.success(ctx, cart, 'Item removed from cart successfully')
  }

  public async clear(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const cart = await this.cartService.clearCart(user.id)
    return ApiResponse.success(ctx, cart, 'Cart cleared successfully')
  }
}
