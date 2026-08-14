import MenuItem from 'App/Models/MenuItem'
import { MenuItemStatus } from 'App/Constants/Status'
import { MenuItemNotFoundException } from 'App/Exceptions/CustomExceptions'

export class MenuItemRepository {
  public async insert(data: Partial<MenuItem>): Promise<MenuItem> {
    const menuItem = new MenuItem()
    menuItem.fill(data)
    await menuItem.save()
    return menuItem
  }

  public async findById(id: string): Promise<MenuItem | null> {
    return await MenuItem.query()
      .where('id', id)
      .andWhere('status', '!=', MenuItemStatus.DELETED)
      .preload('category')
      .first()
  }

  public async findByRestaurantId(restaurantId: string): Promise<MenuItem[]> {
    return await MenuItem.query()
      .where('restaurant_id', restaurantId)
      .andWhere('status', '!=', MenuItemStatus.DELETED)
      .preload('category')
      .orderBy('name', 'asc')
  }

  public async findByCategoryId(categoryId: string): Promise<MenuItem[]> {
    return await MenuItem.query()
      .where('category_id', categoryId)
      .andWhere('status', '!=', MenuItemStatus.DELETED)
      .orderBy('name', 'asc')
  }

  public async update(id: string, data: Partial<MenuItem>): Promise<MenuItem> {
    const menuItem = await MenuItem.query()
      .where('id', id)
      .andWhere('status', '!=', MenuItemStatus.DELETED)
      .first()

    if (!menuItem) {
      throw new MenuItemNotFoundException()
    }

    menuItem.merge(data)
    await menuItem.save()
    return menuItem
  }

  public async setAvailability(id: string, isAvailable: boolean): Promise<MenuItem> {
    const menuItem = await MenuItem.query()
      .where('id', id)
      .andWhere('status', '!=', MenuItemStatus.DELETED)
      .first()

    if (!menuItem) {
      throw new MenuItemNotFoundException()
    }

    menuItem.isAvailable = isAvailable
    await menuItem.save()
    return menuItem
  }

  public async setStatus(id: string, status: MenuItemStatus): Promise<MenuItem> {
    const menuItem = await MenuItem.find(id)
    if (!menuItem) {
      throw new MenuItemNotFoundException()
    }

    menuItem.status = status
    await menuItem.save()
    return menuItem
  }
}
