import Category from 'App/Models/Category'
import { CategoryStatus } from 'App/Constants/Status'
import { CategoryNotFoundException } from 'App/Exceptions/CustomExceptions'

export class CategoryRepository {
  public async insert(data: Partial<Category>): Promise<Category> {
    const category = new Category()
    category.fill(data)
    await category.save()
    return category
  }

  public async findById(id: string): Promise<Category | null> {
    return await Category.query()
      .where('id', id)
      .andWhere('status', '!=', CategoryStatus.DELETED)
      .first()
  }

  public async findByRestaurantId(restaurantId: string): Promise<Category[]> {
    return await Category.query()
      .where('restaurant_id', restaurantId)
      .andWhere('status', '!=', CategoryStatus.DELETED)
      .preload('menuItems', (mq) => mq.where('status', '!=', 'DELETED'))
      .orderBy('name', 'asc')
  }

  public async update(id: string, data: Partial<Category>): Promise<Category> {
    const category = await Category.query()
      .where('id', id)
      .andWhere('status', '!=', CategoryStatus.DELETED)
      .first()

    if (!category) {
      throw new CategoryNotFoundException()
    }

    category.merge(data)
    await category.save()
    return category
  }

  public async setStatus(id: string, status: CategoryStatus): Promise<Category> {
    const category = await Category.find(id)
    if (!category) {
      throw new CategoryNotFoundException()
    }

    category.status = status
    await category.save()
    return category
  }
}
