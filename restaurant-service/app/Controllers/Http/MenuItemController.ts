import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { RestaurantService } from 'App/Services/RestaurantService'
import { ApiResponse } from 'App/Response/ApiResponse'
import CreateMenuItemValidator from 'App/Validators/CreateMenuItemValidator'
import UpdateMenuItemValidator from 'App/Validators/UpdateMenuItemValidator'
import UpdateAvailabilityValidator from 'App/Validators/UpdateAvailabilityValidator'

export default class MenuItemController {
  private restaurantService = new RestaurantService()

  public async store(ctx: HttpContextContract) {
    const user = (ctx.auth as any).user
    const restaurantId = ctx.params.restaurantId
    const payload = await ctx.request.validate(CreateMenuItemValidator)

    const menuItem = await this.restaurantService.createMenuItem(
      restaurantId,
      user.id,
      user.roles,
      payload
    )
    return ApiResponse.success(ctx, menuItem, 'Menu item created successfully', {}, 201)
  }

  public async index(ctx: HttpContextContract) {
    const restaurantId = ctx.params.restaurantId
    const menuItems = await this.restaurantService.getMenuItems(restaurantId)
    return ApiResponse.success(ctx, menuItems, 'Menu items retrieved successfully')
  }

  public async show(ctx: HttpContextContract) {
    const restaurantId = ctx.params.restaurantId
    const itemId = ctx.params.itemId
    const menuItem = await this.restaurantService.getMenuItemById(restaurantId, itemId)
    return ApiResponse.success(ctx, menuItem, 'Menu item retrieved successfully')
  }

  public async update(ctx: HttpContextContract) {
    const user = (ctx.auth as any).user
    const restaurantId = ctx.params.restaurantId
    const itemId = ctx.params.itemId
    const payload = await ctx.request.validate(UpdateMenuItemValidator)

    const menuItem = await this.restaurantService.updateMenuItem(
      restaurantId,
      itemId,
      user.id,
      user.roles,
      payload
    )
    return ApiResponse.success(ctx, menuItem, 'Menu item updated successfully')
  }

  public async updateAvailability(ctx: HttpContextContract) {
    const user = (ctx.auth as any).user
    const restaurantId = ctx.params.restaurantId
    const itemId = ctx.params.itemId
    const payload = await ctx.request.validate(UpdateAvailabilityValidator)

    const menuItem = await this.restaurantService.setMenuItemAvailability(
      restaurantId,
      itemId,
      user.id,
      user.roles,
      payload.is_available
    )
    return ApiResponse.success(ctx, menuItem, 'Menu item availability updated successfully')
  }

  public async destroy(ctx: HttpContextContract) {
    const user = (ctx.auth as any).user
    const restaurantId = ctx.params.restaurantId
    const itemId = ctx.params.itemId

    const menuItem = await this.restaurantService.deleteMenuItem(
      restaurantId,
      itemId,
      user.id,
      user.roles
    )
    return ApiResponse.success(ctx, menuItem, 'Menu item soft deleted successfully')
  }

  public async restore(ctx: HttpContextContract) {
    const user = (ctx.auth as any).user
    const restaurantId = ctx.params.restaurantId
    const itemId = ctx.params.itemId

    const menuItem = await this.restaurantService.restoreMenuItem(
      restaurantId,
      itemId,
      user.id,
      user.roles
    )
    return ApiResponse.success(ctx, menuItem, 'Menu item restored successfully')
  }
}
