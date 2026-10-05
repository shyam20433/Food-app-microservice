import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { subscribeToEvent } from 'App/Services/RabbitMQService'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {}

  public async boot() {}

  public async ready() {
    if (this.app.environment === 'web') {
      const { PaymentService } = await import('App/Services/PaymentService')
      const paymentService = new PaymentService()

      await subscribeToEvent('payment_order_created_queue', 'order.created', async (data) => {
        await paymentService.handleOrderCreated(data)
      })

      // Saga Step 2: process refund when restaurant requests cancellation
      await subscribeToEvent('payment_order_cancellation_requested_queue', 'order.cancellation_requested', async (data) => {
        await paymentService.handleOrderCancellationRequested(data)
      })
    }
  }

  public async shutdown() {}
}
