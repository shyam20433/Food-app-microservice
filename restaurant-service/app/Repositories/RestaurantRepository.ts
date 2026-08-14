import Restaurant from 'App/Models/Restaurant'
import { RestaurantStatus } from 'App/Constants/Status'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import { RestaurantNotFoundException } from 'App/Exceptions/CustomExceptions'

export class RestaurantRepository {
  public async insert(
    data: Partial<Restaurant>,
    options?: { client?: TransactionClientContract }
  ): Promise<Restaurant> {
    const restaurant = new Restaurant()
    restaurant.fill(data)
    if (options?.client) {
      restaurant.useTransaction(options.client)
    }
    await restaurant.save()
    return restaurant
  }

  public async findById(id: string, includeDetails: boolean = false): Promise<Restaurant | null> {
    const query = Restaurant.query()
      .where('id', id)
      .andWhere('status', '!=', RestaurantStatus.DELETED)

    if (includeDetails) {
      query
        .preload('address', (addressQuery) => {
          addressQuery.where('status', '!=', 'DELETED')
        })
        .preload('categories', (categoryQuery) => {
          categoryQuery.where('status', '!=', 'DELETED')
        })
        .preload('menuItems', (menuQuery) => {
          menuQuery.where('status', '!=', 'DELETED')
        })
    }

    return await query.first()
  }

  public async findByOwnerId(
    ownerId: string,
    options?: { page?: number; limit?: number }
  ): Promise<{ data: Restaurant[]; meta: any }> {
    const page = options?.page || 1
    const limit = options?.limit || 20

    const paginated = await Restaurant.query()
      .where('owner_id', ownerId)
      .andWhere('status', '!=', RestaurantStatus.DELETED)
      .preload('address', (aq) => aq.where('status', '!=', 'DELETED'))
      .orderBy('created_at', 'desc')
      .paginate(page, limit)

    const json = paginated.toJSON()
    return {
      data: json.data as Restaurant[],
      meta: json.meta,
    }
  }

  public async findAll(options?: {
    page?: number
    limit?: number
    search?: string
    status?: RestaurantStatus
  }): Promise<{ data: Restaurant[]; meta: any }> {
    const page = options?.page || 1
    const limit = options?.limit || 20

    // Default public customer filter: ALWAYS filter status = ENABLED. Ignore DELETED query params.
    const targetStatus =
      options?.status && options.status !== RestaurantStatus.DELETED
        ? options.status
        : RestaurantStatus.ENABLED

    const query = Restaurant.query().where('status', targetStatus)

    if (options?.search) {
      const searchPattern = `%${options.search}%`
      query.andWhere((q) => {
        q.where('name', 'ILIKE', searchPattern).orWhere('description', 'ILIKE', searchPattern)
      })
    }

    query
      .preload('address', (aq) => aq.where('status', '!=', 'DELETED'))
      .orderBy('created_at', 'desc')

    const paginated = await query.paginate(page, limit)
    const json = paginated.toJSON()

    return {
      data: json.data as Restaurant[],
      meta: json.meta,
    }
  }

  public async update(id: string, data: Partial<Restaurant>): Promise<Restaurant> {
    const restaurant = await Restaurant.query()
      .where('id', id)
      .andWhere('status', '!=', RestaurantStatus.DELETED)
      .first()

    if (!restaurant) {
      throw new RestaurantNotFoundException()
    }

    restaurant.merge(data)
    await restaurant.save()
    return restaurant
  }

  public async setStatus(id: string, status: RestaurantStatus): Promise<Restaurant> {
    const restaurant = await Restaurant.find(id)
    if (!restaurant) {
      throw new RestaurantNotFoundException()
    }

    restaurant.status = status
    await restaurant.save()
    return restaurant
  }
}
