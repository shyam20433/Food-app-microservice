import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
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
    const { id } = await ctx.request.validate({
      schema: schema.create({ id: schema.string({}, [rules.uuid()]) }),
      messages: { 'id.uuid': 'id must be a valid UUID' },
      data: { ...ctx.params, ...ctx.request.all() },
    })
    const payload = await ctx.request.validate(UpdateCartItemValidator)

    const cart = await this.cartService.updateItemQuantity(user.id, id, payload.quantity)
    return ApiResponse.success(ctx, cart, 'Cart item quantity updated successfully')
  }

  public async removeItem(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { id } = await ctx.request.validate({
      schema: schema.create({ id: schema.string({}, [rules.uuid()]) }),
      messages: { 'id.uuid': 'id must be a valid UUID' },
      data: { ...ctx.params, ...ctx.request.all() },
    })

    const cart = await this.cartService.removeItem(user.id, id)
    return ApiResponse.success(ctx, cart, 'Item removed from cart successfully')
  }

  public async clear(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const cart = await this.cartService.clearCart(user.id)
    return ApiResponse.success(ctx, cart, 'Cart cleared successfully')
  }
}
