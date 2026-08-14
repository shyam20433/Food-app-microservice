import axios from 'axios'
import Env from '@ioc:Adonis/Core/Env'
import {
  RestaurantNotFoundException,
  MenuItemNotFoundException,
  MenuItemUnavailableException,
  MenuItemRestaurantMismatchException,
} from 'App/Exceptions/CustomExceptions'

export class RestaurantClient {
  private baseUrl = Env.get('RESTAURANT_SERVICE_URL', 'http://127.0.0.1:3334')

  public async getRestaurant(restaurantId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/restaurants/${restaurantId}`, {
        timeout: 5000,
      })
      if (response.data && response.data.data) {
        return response.data.data
      }
      throw new RestaurantNotFoundException()
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new RestaurantNotFoundException()
      }
      if (error instanceof RestaurantNotFoundException) {
        throw error
      }
      throw new RestaurantNotFoundException(`Unable to reach Restaurant Service: ${error.message}`)
    }
  }

  public async getOwnerRestaurants(ownerId: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/restaurants?owner_id=${ownerId}`, {
        timeout: 5000,
      })
      const list = response.data?.data || response.data || []
      return Array.isArray(list) ? list.filter((r: any) => r.owner_id === ownerId || r.ownerId === ownerId) : []
    } catch {
      return []
    }
  }

  public async getMenuItem(restaurantId: string, menuItemId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/restaurants/${restaurantId}/menu-items/${menuItemId}`,
        { timeout: 5000 }
      )
      if (response.data && response.data.data) {
        return response.data.data
      }
      throw new MenuItemNotFoundException()
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new MenuItemNotFoundException()
      }
      if (error instanceof MenuItemNotFoundException) {
        throw error
      }
      throw new MenuItemNotFoundException(`Unable to reach Restaurant Service: ${error.message}`)
    }
  }

  public async verifyMenuItemBelongsToRestaurant(
    restaurantId: string,
    menuItemId: string
  ): Promise<any> {
    const menuItem = await this.getMenuItem(restaurantId, menuItemId)
    if (!menuItem || menuItem.restaurant_id !== restaurantId) {
      throw new MenuItemRestaurantMismatchException()
    }
    return menuItem
  }

  public async checkMenuItemAvailability(
    restaurantId: string,
    menuItemId: string
  ): Promise<boolean> {
    const menuItem = await this.getMenuItem(restaurantId, menuItemId)
    if (!menuItem.is_available || menuItem.status === 'DELETED') {
      throw new MenuItemUnavailableException()
    }
    return true
  }

  public async getMenuItemPrice(restaurantId: string, menuItemId: string): Promise<number> {
    const menuItem = await this.getMenuItem(restaurantId, menuItemId)
    return Number(menuItem.price)
  }
}
