import axios from 'axios'
import Env from '@ioc:Adonis/Core/Env'
import { AddressNotFoundException } from 'App/Exceptions/CustomExceptions'

export class UserClient {
  private baseUrl = Env.get('USER_SERVICE_URL', 'http://127.0.0.1:3333')

  public async getUserAddress(userId: string, addressId: string, token?: string): Promise<any> {
    try {
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`
      }

      const response = await axios.get(`${this.baseUrl}/addresses/${addressId}`, {
        headers,
        timeout: 5000,
      })

      const addressData = response.data?.data || response.data
      if (!addressData) {
        throw new AddressNotFoundException()
      }

      // Ensure address belongs to the requesting user
      const ownerId = addressData.user_id || addressData.userId
      if (ownerId && ownerId !== userId) {
        throw new AddressNotFoundException('Delivery address does not belong to the user')
      }

      return {
        label: addressData.label || 'Home',
        house_no: addressData.house_no || addressData.houseNo || '',
        street: addressData.street || '',
        area: addressData.area || '',
        city: addressData.city || '',
        state: addressData.state || '',
        pincode: addressData.pincode || '',
        latitude: addressData.latitude || null,
        longitude: addressData.longitude || null,
      }
    } catch (error: any) {
      if (error instanceof AddressNotFoundException) {
        throw error
      }
      if (error.response?.status === 404) {
        throw new AddressNotFoundException()
      }
      // If user-service call fails or is unreachable in standalone mode, throw AddressNotFoundException
      throw new AddressNotFoundException(
        `Unable to fetch delivery address from User Service: ${error.message}`
      )
    }
  }
}
