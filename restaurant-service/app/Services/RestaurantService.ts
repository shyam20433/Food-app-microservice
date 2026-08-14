import Database from '@ioc:Adonis/Lucid/Database'
import { RestaurantRepository } from 'App/Repositories/RestaurantRepository'
import { RestaurantAddressRepository } from 'App/Repositories/RestaurantAddressRepository'
import { CategoryRepository } from 'App/Repositories/CategoryRepository'
import { MenuItemRepository } from 'App/Repositories/MenuItemRepository'
import Restaurant from 'App/Models/Restaurant'
import RestaurantAddress from 'App/Models/RestaurantAddress'
import Category from 'App/Models/Category'
import MenuItem from 'App/Models/MenuItem'
import { RestaurantStatus, AddressStatus, CategoryStatus, MenuItemStatus } from 'App/Constants/Status'
import { Roles } from 'App/Constants/Roles'
import {
  RestaurantNotFoundException,
  CategoryNotFoundException,
  MenuItemNotFoundException,
  AddressNotFoundException,
  RestaurantAccessDeniedException,
  CategoryNotBelongToRestaurantException,
  BadRequestException,
  AddressAlreadyExistsException,
} from 'App/Exceptions/CustomExceptions'

export class RestaurantService {
  private restaurantRepo = new RestaurantRepository()
  private addressRepo = new RestaurantAddressRepository()
  private categoryRepo = new CategoryRepository()
  private menuItemRepo = new MenuItemRepository()

  private ensureOwnershipOrAdmin(restaurantOwnerId: string, userId: string, roles: string[] = []) {
    const isAdmin = roles.includes(Roles.ADMIN) || roles.includes(Roles.SUPER_ADMIN)
    if (!isAdmin && restaurantOwnerId !== userId) {
      throw new RestaurantAccessDeniedException()
    }
  }

  // --- Restaurant Operations ---

  public async createRestaurant(userId: string, roles: string[], payload: any): Promise<Restaurant> {
    const isAdmin = roles.includes(Roles.ADMIN) || roles.includes(Roles.SUPER_ADMIN)
    const finalOwnerId = isAdmin && payload.owner_id ? payload.owner_id : userId

    const trx = await Database.transaction()

    try {
      const restaurantData: Partial<Restaurant> = {
        ownerId: finalOwnerId,
        name: payload.name,
        description: payload.description || null,
        phoneNumber: payload.phone_number,
        email: payload.email,
        logo: payload.logo || null,
        openingTime: payload.opening_time || null,
        closingTime: payload.closing_time || null,
        deliveryRadius: payload.delivery_radius || 5.0,
        status: payload.status || RestaurantStatus.ENABLED,
      }

      const restaurant = await this.restaurantRepo.insert(restaurantData, { client: trx })

      if (payload.address) {
        const addressData: Partial<RestaurantAddress> = {
          restaurantId: restaurant.id,
          houseNo: payload.address.house_no,
          street: payload.address.street,
          area: payload.address.area || null,
          city: payload.address.city,
          state: payload.address.state,
          pincode: payload.address.pincode,
          latitude: payload.address.latitude !== undefined ? payload.address.latitude : null,
          longitude: payload.address.longitude !== undefined ? payload.address.longitude : null,
          status: AddressStatus.ENABLED,
        }
        await this.addressRepo.insert(addressData, { client: trx })
      }

      await trx.commit()

      const result = await this.restaurantRepo.findById(restaurant.id, true)
      return result!
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  public async getRestaurantById(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantRepo.findById(id, true)
    if (!restaurant) {
      throw new RestaurantNotFoundException()
    }
    return restaurant
  }

  public async listRestaurants(params: any): Promise<{ data: Restaurant[]; meta: any }> {
    return await this.restaurantRepo.findAll(params)
  }

  public async updateRestaurant(
    id: string,
    userId: string,
    roles: string[],
    payload: any
  ): Promise<Restaurant> {
    const restaurant = await this.getRestaurantById(id)
    this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles)

    const updateData: Partial<Restaurant> = {}
    if (payload.name !== undefined) updateData.name = payload.name
    if (payload.description !== undefined) updateData.description = payload.description
    if (payload.phone_number !== undefined) updateData.phoneNumber = payload.phone_number
    if (payload.email !== undefined) updateData.email = payload.email
    if (payload.logo !== undefined) updateData.logo = payload.logo
    if (payload.opening_time !== undefined) updateData.openingTime = payload.opening_time
    if (payload.closing_time !== undefined) updateData.closingTime = payload.closing_time
    if (payload.delivery_radius !== undefined) updateData.deliveryRadius = payload.delivery_radius
    if (payload.status !== undefined) updateData.status = payload.status

    return await this.restaurantRepo.update(id, updateData)
  }

  public async deleteRestaurant(id: string, userId: string, roles: string[]): Promise<Restaurant> {
    const restaurant = await this.getRestaurantById(id)
    this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles)
    return await this.restaurantRepo.setStatus(id, RestaurantStatus.DELETED)
  }

  public async setRestaurantStatus(
    id: string,
    userId: string,
    roles: string[],
    status: RestaurantStatus
  ): Promise<Restaurant> {
    if (status === RestaurantStatus.DELETED) {
      throw new BadRequestException('DELETED status cannot be set via PATCH /status. Soft deletion must be performed via DELETE /restaurants/:id')
    }
    const restaurant = await this.getRestaurantById(id)
    this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles)
    return await this.restaurantRepo.setStatus(id, status)
  }

  // --- Restaurant Address Operations ---

  public async createAddress(
    restaurantId: string,
    userId: string,
    roles: string[],
    payload: any
  ): Promise<RestaurantAddress> {
    const restaurant = await this.getRestaurantById(restaurantId)
    this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles)

    const existing = await this.addressRepo.findByRestaurantId(restaurantId)
    if (existing) {
      throw new AddressAlreadyExistsException()
    }

    return await this.addressRepo.insert({
      restaurantId: restaurantId,
      houseNo: payload.house_no,
      street: payload.street,
      area: payload.area || null,
      city: payload.city,
      state: payload.state,
      pincode: payload.pincode,
      latitude: payload.latitude !== undefined ? payload.latitude : null,
      longitude: payload.longitude !== undefined ? payload.longitude : null,
      status: payload.status || AddressStatus.ENABLED,
    })
  }

  public async getAddress(restaurantId: string): Promise<RestaurantAddress> {
    await this.getRestaurantById(restaurantId)
    const address = await this.addressRepo.findByRestaurantId(restaurantId)
    if (!address) {
      throw new AddressNotFoundException()
    }
    return address
  }

  public async updateAddress(
    restaurantId: string,
    userId: string,
    roles: string[],
    payload: any
  ): Promise<RestaurantAddress> {
    const restaurant = await this.getRestaurantById(restaurantId)
    this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles)

    const updateData: Partial<RestaurantAddress> = {}
    if (payload.house_no !== undefined) updateData.houseNo = payload.house_no
    if (payload.street !== undefined) updateData.street = payload.street
    if (payload.area !== undefined) updateData.area = payload.area
    if (payload.city !== undefined) updateData.city = payload.city
    if (payload.state !== undefined) updateData.state = payload.state
    if (payload.pincode !== undefined) updateData.pincode = payload.pincode
    if (payload.latitude !== undefined) updateData.latitude = payload.latitude
    if (payload.longitude !== undefined) updateData.longitude = payload.longitude
    if (payload.status !== undefined) updateData.status = payload.status

    return await this.addressRepo.update(restaurantId, updateData)
  }

  public async deleteAddress(
    restaurantId: string,
    userId: string,
    roles: string[]
  ): Promise<RestaurantAddress> {
    const restaurant = await this.getRestaurantById(restaurantId)
    this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles)
    return await this.addressRepo.setStatus(restaurantId, AddressStatus.DELETED)
  }

  // --- Category Operations ---

  public async createCategory(
    restaurantId: string,
    userId: string,
    roles: string[],
    payload: any
  ): Promise<Category> {
    const restaurant = await this.getRestaurantById(restaurantId)
    this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles)

    return await this.categoryRepo.insert({
      restaurantId: restaurantId,
      name: payload.name,
      description: payload.description || null,
      status: payload.status || CategoryStatus.ENABLED,
    })
  }

  public async getCategories(restaurantId: string): Promise<Category[]> {
    await this.getRestaurantById(restaurantId)
    return await this.categoryRepo.findByRestaurantId(restaurantId)
  }

  public async getCategoryById(restaurantId: string, categoryId: string): Promise<Category> {
    await this.getRestaurantById(restaurantId)
    const category = await this.categoryRepo.findById(categoryId)
    if (!category || category.restaurantId !== restaurantId) {
      throw new CategoryNotFoundException()
    }
    return category
  }

  public async updateCategory(
    restaurantId: string,
    categoryId: string,
    userId: string,
    roles: string[],
    payload: any
  ): Promise<Category> {
    const restaurant = await this.getRestaurantById(restaurantId)
    this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles)

    const category = await this.getCategoryById(restaurantId, categoryId)

    const updateData: Partial<Category> = {}
    if (payload.name !== undefined) updateData.name = payload.name
    if (payload.description !== undefined) updateData.description = payload.description
    if (payload.status !== undefined) updateData.status = payload.status

    return await this.categoryRepo.update(category.id, updateData)
  }

  public async deleteCategory(
    restaurantId: string,
    categoryId: string,
    userId: string,
    roles: string[]
  ): Promise<Category> {
    const restaurant = await this.getRestaurantById(restaurantId)
    this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles)

    const category = await this.getCategoryById(restaurantId, categoryId)
    return await this.categoryRepo.setStatus(category.id, CategoryStatus.DELETED)
  }

  // --- Menu Item Operations ---

  public async createMenuItem(
    restaurantId: string,
    userId: string,
    roles: string[],
    payload: any
  ): Promise<MenuItem> {
    const restaurant = await this.getRestaurantById(restaurantId)
    this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles)

    // Verification: Category must belong to THIS restaurant
    const category = await this.categoryRepo.findById(payload.category_id)
    if (!category || category.status === CategoryStatus.DELETED) {
      throw new CategoryNotFoundException()
    }
    if (category.restaurantId !== restaurantId) {
      throw new CategoryNotBelongToRestaurantException()
    }

    return await this.menuItemRepo.insert({
      restaurantId: restaurantId,
      categoryId: payload.category_id,
      name: payload.name,
      description: payload.description || null,
      price: payload.price,
      image: payload.image || null,
      isVegetarian: payload.is_vegetarian !== undefined ? payload.is_vegetarian : false,
      preparationTime: payload.preparation_time !== undefined ? payload.preparation_time : 15,
      isAvailable: payload.is_available !== undefined ? payload.is_available : true,
      status: payload.status || MenuItemStatus.ENABLED,
    })
  }

  public async getMenuItems(restaurantId: string): Promise<MenuItem[]> {
    await this.getRestaurantById(restaurantId)
    return await this.menuItemRepo.findByRestaurantId(restaurantId)
  }

  public async getMenuItemById(restaurantId: string, itemId: string): Promise<MenuItem> {
    await this.getRestaurantById(restaurantId)
    const menuItem = await this.menuItemRepo.findById(itemId)
    if (!menuItem || menuItem.restaurantId !== restaurantId) {
      throw new MenuItemNotFoundException()
    }
    return menuItem
  }

  public async updateMenuItem(
    restaurantId: string,
    itemId: string,
    userId: string,
    roles: string[],
    payload: any
  ): Promise<MenuItem> {
    const restaurant = await this.getRestaurantById(restaurantId)
    this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles)

    const menuItem = await this.getMenuItemById(restaurantId, itemId)

    if (payload.category_id) {
      const category = await this.categoryRepo.findById(payload.category_id)
      if (!category || category.status === CategoryStatus.DELETED) {
        throw new CategoryNotFoundException()
      }
      if (category.restaurantId !== restaurantId) {
        throw new CategoryNotBelongToRestaurantException()
      }
    }

    const updateData: Partial<MenuItem> = {}
    if (payload.category_id !== undefined) updateData.categoryId = payload.category_id
    if (payload.name !== undefined) updateData.name = payload.name
    if (payload.description !== undefined) updateData.description = payload.description
    if (payload.price !== undefined) updateData.price = payload.price
    if (payload.image !== undefined) updateData.image = payload.image
    if (payload.is_vegetarian !== undefined) updateData.isVegetarian = payload.is_vegetarian
    if (payload.preparation_time !== undefined) updateData.preparationTime = payload.preparation_time
    if (payload.is_available !== undefined) updateData.isAvailable = payload.is_available
    if (payload.status !== undefined) updateData.status = payload.status

    return await this.menuItemRepo.update(menuItem.id, updateData)
  }

  public async setMenuItemAvailability(
    restaurantId: string,
    itemId: string,
    userId: string,
    roles: string[],
    isAvailable: boolean
  ): Promise<MenuItem> {
    const restaurant = await this.getRestaurantById(restaurantId)
    this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles)

    const menuItem = await this.getMenuItemById(restaurantId, itemId)
    return await this.menuItemRepo.setAvailability(menuItem.id, isAvailable)
  }

  public async restoreRestaurant(id: string, userId: string, roles: string[]): Promise<Restaurant> {
    const restaurant = await Restaurant.find(id)
    if (!restaurant) {
      throw new RestaurantNotFoundException()
    }
    this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles)
    return await this.restaurantRepo.setStatus(id, RestaurantStatus.ENABLED)
  }

  public async restoreAddress(
    restaurantId: string,
    userId: string,
    roles: string[]
  ): Promise<RestaurantAddress> {
    const restaurant = await this.getRestaurantById(restaurantId)
    this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles)
    return await this.addressRepo.setStatus(restaurantId, AddressStatus.ENABLED)
  }

  public async restoreCategory(
    restaurantId: string,
    categoryId: string,
    userId: string,
    roles: string[]
  ): Promise<Category> {
    const restaurant = await this.getRestaurantById(restaurantId)
    this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles)

    const category = await Category.find(categoryId)
    if (!category || category.restaurantId !== restaurantId) {
      throw new CategoryNotFoundException()
    }
    return await this.categoryRepo.setStatus(category.id, CategoryStatus.ENABLED)
  }

  public async restoreMenuItem(
    restaurantId: string,
    itemId: string,
    userId: string,
    roles: string[]
  ): Promise<MenuItem> {
    const restaurant = await this.getRestaurantById(restaurantId)
    this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles)

    const menuItem = await MenuItem.find(itemId)
    if (!menuItem || menuItem.restaurantId !== restaurantId) {
      throw new MenuItemNotFoundException()
    }
    return await this.menuItemRepo.setStatus(menuItem.id, MenuItemStatus.ENABLED)
  }

  public async deleteMenuItem(
    restaurantId: string,
    itemId: string,
    userId: string,
    roles: string[]
  ): Promise<MenuItem> {
    const restaurant = await this.getRestaurantById(restaurantId)
    this.ensureOwnershipOrAdmin(restaurant.ownerId, userId, roles)

    const menuItem = await this.getMenuItemById(restaurantId, itemId)
    return await this.menuItemRepo.setStatus(menuItem.id, MenuItemStatus.DELETED)
  }
}
