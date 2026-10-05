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

      // Saga: payment service confirmed refund → finalize order as CANCELLED
      await subscribeToEvent('order_refund_processed_queue', 'payment.refund_processed', async (data) => {
        await orderService.handleRefundProcessed(data)
      })

      // Saga: payment service failed to refund → compensation: revert order to previous status
      await subscribeToEvent('order_refund_failed_queue', 'payment.refund_failed', async (data) => {
        await orderService.handleRefundFailed(data)
      })
    }
  }

  public async shutdown() {}
}
