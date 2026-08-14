import axios from 'axios'
import Env from '@ioc:Adonis/Core/Env'
import {
  OrderNotFoundException,
  OrderAccessDeniedException,
  OrderNotPayableException,
} from 'App/Exceptions/CustomExceptions'

export interface OrderDetails {
  id: string
  orderNumber: string
  userId: string
  restaurantId: string
  totalAmount: number
  orderStatus: string
}

export class OrderClient {
  private baseUrl = Env.get('ORDER_SERVICE_URL', 'http://127.0.0.1:3335')

  public async getOrder(orderId: string, token?: string): Promise<OrderDetails> {
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
      if (!data) {
        throw new OrderNotFoundException()
      }

      return {
        id: data.id,
        orderNumber: data.order_number || data.orderNumber,
        userId: data.user_id || data.userId,
        restaurantId: data.restaurant_id || data.restaurantId,
        totalAmount: Number(data.total_amount || data.totalAmount),
        orderStatus: data.order_status || data.orderStatus,
      }
    } catch (error: any) {
      if (
        error instanceof OrderNotFoundException ||
        error instanceof OrderAccessDeniedException ||
        error instanceof OrderNotPayableException
      ) {
        throw error
      }
      if (error.response?.status === 404) {
        throw new OrderNotFoundException()
      }
      if (error.response?.status === 403) {
        throw new OrderAccessDeniedException()
      }
      throw new OrderNotFoundException(
        `Unable to fetch order information from Order Service: ${error.message}`
      )
    }
  }

  public async verifyOrderPayable(order: OrderDetails, userId: string): Promise<boolean> {
    if (order.userId !== userId) {
      throw new OrderAccessDeniedException()
    }

    // Orders in PENDING, CONFIRMED, PREPARING status are payable
    const payableStatuses = ['PENDING', 'CONFIRMED', 'PREPARING']
    if (!payableStatuses.includes(order.orderStatus)) {
      throw new OrderNotPayableException(
        `Order is in status ${order.orderStatus} and cannot accept payment`
      )
    }

    return true
  }
}
