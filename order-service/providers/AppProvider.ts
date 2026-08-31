import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { subscribeToEvent } from 'App/Services/RabbitMQService'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {}

  public async boot() {}

  public async ready() {
    if (this.app.environment === 'web') {
      const { OrderService } = await import('App/Services/OrderService')
      const orderService = new OrderService()

      // Subscribe to payment.succeeded event
      await subscribeToEvent('order_payment_succeeded_queue', 'payment.succeeded', async (data) => {
        await orderService.handlePaymentSucceeded(data)
      })

      // Subscribe to payment.failed event
      await subscribeToEvent('order_payment_failed_queue', 'payment.failed', async (data) => {
        await orderService.handlePaymentFailed(data)
      })

      // Subscribe to delivery.status_updated event
      await subscribeToEvent('order_delivery_status_queue', 'delivery.status_updated', async (data) => {
        await orderService.handleDeliveryStatusUpdated(data)
      })
    }
  }

  public async shutdown() {}
}
