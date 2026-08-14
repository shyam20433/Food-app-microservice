import axios from 'axios'
import Env from '@ioc:Adonis/Core/Env'
import {
  OrderNotFoundException,
  OrderNotReadyForDeliveryException,
} from 'App/Exceptions/CustomExceptions'

export interface OrderDeliveryDetails {
  id: string
  orderNumber: string
  userId: string
  restaurantId: string
  totalAmount: number
  orderStatus: string
  deliveryAddress: {
    label?: string
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

export class OrderClient {
  private baseUrl = Env.get('ORDER_SERVICE_URL', 'http://127.0.0.1:3335')

  public async getOrder(orderId: string, token?: string): Promise<OrderDeliveryDetails> {
    try {
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`
      }

      const response = await axios.get(`${this.baseUrl}/orders/${orderId}`, {
        headers,
        timeout: 5000,
      })

      const data = response.data?.data || response.data
      if (!data) throw new OrderNotFoundException()

      const addr = data.delivery_address || data.deliveryAddress || {}

      return {
        id: data.id,
        orderNumber: data.order_number || data.orderNumber,
        userId: data.user_id || data.userId,
        restaurantId: data.restaurant_id || data.restaurantId,
        totalAmount: Number(data.total_amount || data.totalAmount),
        orderStatus: data.order_status || data.orderStatus,
        deliveryAddress: {
          label: addr.label || 'Home',
          houseNo: addr.house_no || addr.houseNo,
          street: addr.street,
          area: addr.area,
          city: addr.city || 'Coimbatore',
          state: addr.state || 'Tamil Nadu',
          pincode: addr.pincode || '641035',
          latitude: Number(addr.latitude || 11.0168),
          longitude: Number(addr.longitude || 76.9558),
        },
      }
    } catch (error: any) {
      if (
        error instanceof OrderNotFoundException ||
        error instanceof OrderNotReadyForDeliveryException
      ) {
        throw error
      }
      if (error.response?.status === 404) {
        throw new OrderNotFoundException()
      }
      throw new OrderNotFoundException(
        `Unable to fetch order details from Order Service: ${error.message}`
      )
    }
  }

  public async verifyOrderEligibleForDelivery(order: OrderDeliveryDetails): Promise<boolean> {
    // Eligible status: CONFIRMED, PREPARING, READY
    const eligibleStatuses = ['CONFIRMED', 'PREPARING', 'READY']
    if (!eligibleStatuses.includes(order.orderStatus)) {
      throw new OrderNotReadyForDeliveryException(
        `Order is in status '${order.orderStatus}' and is not eligible for delivery assignment`
      )
    }
    return true
  }

  public async getCustomerOrderIds(_userId: string, token?: string): Promise<string[]> {
    try {
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`
      }

      const response = await axios.get(`${this.baseUrl}/orders`, {
        headers,
        timeout: 5000,
      })

      const items = response.data?.data || response.data || []
      return items.map((o: any) => o.id)
    } catch {
      return []
    }
  }
}
