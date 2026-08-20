import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { RestaurantService } from 'App/Services/RestaurantService'
import { ApiResponse } from 'App/Response/ApiResponse'
import CreateCategoryValidator from 'App/Validators/CreateCategoryValidator'
import UpdateCategoryValidator from 'App/Validators/UpdateCategoryValidator'

export default class CategoryController {
  private restaurantService = new RestaurantService()

  public async store(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { restaurantId } = await ctx.request.validate({
      schema: schema.create({ restaurantId: schema.string({}, [rules.uuid()]) }),
      messages: { 'restaurantId.uuid': 'restaurantId must be a valid UUID' },
      data: { ...ctx.params, ...ctx.request.all() },
    })
    const payload = await ctx.request.validate(CreateCategoryValidator)

    const category = await this.restaurantService.createCategory(
      restaurantId,
      user.id,
      user.roles,
      payload
    )
    return ApiResponse.success(ctx, category, 'Category created successfully', {}, 201)
  }

  public async index(ctx: HttpContextContract) {
    const { restaurantId } = await ctx.request.validate({
      schema: schema.create({ restaurantId: schema.string({}, [rules.uuid()]) }),
      messages: { 'restaurantId.uuid': 'restaurantId must be a valid UUID' },
      data: { ...ctx.params, ...ctx.request.all() },
    })
    const categories = await this.restaurantService.getCategories(restaurantId)
    return ApiResponse.success(ctx, categories, 'Categories retrieved successfully')
  }

  public async show(ctx: HttpContextContract) {
    const { restaurantId, categoryId } = await ctx.request.validate({
      schema: schema.create({
        restaurantId: schema.string({}, [rules.uuid()]),
        categoryId: schema.string({}, [rules.uuid()]),
      }),
      messages: {
        'restaurantId.uuid': 'restaurantId must be a valid UUID',
        'categoryId.uuid': 'categoryId must be a valid UUID',
      },
      data: { ...ctx.params, ...ctx.request.all() },
    })
    const category = await this.restaurantService.getCategoryById(restaurantId, categoryId)
    return ApiResponse.success(ctx, category, 'Category retrieved successfully')
  }

  public async update(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { restaurantId, categoryId } = await ctx.request.validate({
      schema: schema.create({
        restaurantId: schema.string({}, [rules.uuid()]),
        categoryId: schema.string({}, [rules.uuid()]),
      }),
      messages: {
        'restaurantId.uuid': 'restaurantId must be a valid UUID',
        'categoryId.uuid': 'categoryId must be a valid UUID',
      },
      data: { ...ctx.params, ...ctx.request.all() },
    })
    const payload = await ctx.request.validate(UpdateCategoryValidator)

    const category = await this.restaurantService.updateCategory(
      restaurantId,
      categoryId,
      user.id,
      user.roles,
      payload
    )
    return ApiResponse.success(ctx, category, 'Category updated successfully')
  }

  public async destroy(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { restaurantId, categoryId } = await ctx.request.validate({
      schema: schema.create({
        restaurantId: schema.string({}, [rules.uuid()]),
        categoryId: schema.string({}, [rules.uuid()]),
      }),
      messages: {
        'restaurantId.uuid': 'restaurantId must be a valid UUID',
        'categoryId.uuid': 'categoryId must be a valid UUID',
      },
      data: { ...ctx.params, ...ctx.request.all() },
    })

    const category = await this.restaurantService.deleteCategory(
      restaurantId,
      categoryId,
      user.id,
      user.roles
    )
    return ApiResponse.success(ctx, category, 'Category soft deleted successfully')
  }

  public async restore(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const { restaurantId, categoryId } = await ctx.request.validate({
      schema: schema.create({
        restaurantId: schema.string({}, [rules.uuid()]),
        categoryId: schema.string({}, [rules.uuid()]),
      }),
      messages: {
        'restaurantId.uuid': 'restaurantId must be a valid UUID',
        'categoryId.uuid': 'categoryId must be a valid UUID',
      },
      data: { ...ctx.params, ...ctx.request.all() },
    })

    const category = await this.restaurantService.restoreCategory(
      restaurantId,
      categoryId,
      user.id,
      user.roles
    )
    return ApiResponse.success(ctx, category, 'Category restored successfully')
  }
}
