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
    }
  }

  public async shutdown() {}
}
