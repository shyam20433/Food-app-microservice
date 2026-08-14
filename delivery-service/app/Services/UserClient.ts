import axios from 'axios'
import Env from '@ioc:Adonis/Core/Env'
import {
  UserNotFoundException,
  UserNotDeliveryPartnerException,
} from 'App/Exceptions/CustomExceptions'

export interface UserProfile {
  id: string
  name: string
  email: string
  phoneNumber?: string
  roles: string[]
}

export class UserClient {
  private baseUrl = Env.get('USER_SERVICE_URL', 'http://127.0.0.1:3333')

  public async getUser(userId: string, token?: string): Promise<UserProfile> {
    try {
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`
      }

      const response = await axios.get(`${this.baseUrl}/users/${userId}`, {
        headers,
        timeout: 5000,
      })

      const data = response.data?.data || response.data
      if (!data) throw new UserNotFoundException()

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        phoneNumber: data.phone_number || data.phoneNumber,
        roles: data.roles || ['CUSTOMER'],
      }
    } catch (error: any) {
      if (error instanceof UserNotFoundException || error instanceof UserNotDeliveryPartnerException) {
        throw error
      }
      if (error.response?.status === 404) {
        throw new UserNotFoundException()
      }
      throw new UserNotFoundException(`Unable to fetch user details from User Service: ${error.message}`)
    }
  }

  public async verifyDeliveryPartnerRole(userId: string, token?: string): Promise<boolean> {
    const user = await this.getUser(userId, token)
    if (!user.roles.includes('DELIVERY_PARTNER')) {
      throw new UserNotDeliveryPartnerException()
    }
    return true
  }
}
