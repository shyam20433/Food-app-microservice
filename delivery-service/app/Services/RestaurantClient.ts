import axios from 'axios'
import Env from '@ioc:Adonis/Core/Env'
import {
  RestaurantNotFoundException,
  RestaurantAddressNotFoundException,
} from 'App/Exceptions/CustomExceptions'

export interface RestaurantPickupDetails {
  id: string
  name: string
  email: string
  phoneNumber: string
  address: {
    houseNo?: string
    street?: string
    area?: string
    city?: string
    state?: string
    pincode?: string
    latitude: number
    longitude: number
  }
}

export class RestaurantClient {
  private baseUrl = Env.get('RESTAURANT_SERVICE_URL', 'http://127.0.0.1:3334')

  public async getRestaurant(restaurantId: string, token?: string): Promise<RestaurantPickupDetails> {
    try {
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`
      }

      const response = await axios.get(`${this.baseUrl}/restaurants/${restaurantId}`, {
        headers,
        timeout: 5000,
      })

      const data = response.data?.data || response.data
      if (!data) throw new RestaurantNotFoundException()

      const addr = data.address || data.pickup_address || {}

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        phoneNumber: data.phone_number || data.phoneNumber,
        address: {
          houseNo: addr.house_no || addr.houseNo || 'Main Gate',
          street: addr.street || data.name,
          area: addr.area || 'Commercial Zone',
          city: addr.city || 'Coimbatore',
          state: addr.state || 'Tamil Nadu',
          pincode: addr.pincode || '641001',
          latitude: Number(addr.latitude || data.latitude || 11.0168),
          longitude: Number(addr.longitude || data.longitude || 76.9558),
        },
      }
    } catch (error: any) {
      if (
        error instanceof RestaurantNotFoundException ||
        error instanceof RestaurantAddressNotFoundException
      ) {
        throw error
      }
      if (error.response?.status === 404) {
        throw new RestaurantNotFoundException()
      }
      throw new RestaurantNotFoundException(
        `Unable to fetch restaurant details from Restaurant Service: ${error.message}`
      )
    }
  }
}
