import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { subscribeToEvent } from 'App/Services/RabbitMQService'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {}

  public async boot() {}

  public async ready() {
    if (this.app.environment === 'web') {
      const { DeliveryService } = await import('App/Services/DeliveryService')
      const deliveryService = new DeliveryService()

      await subscribeToEvent('delivery_order_confirmed_queue', 'order.confirmed', async (data) => {
        await deliveryService.handleOrderConfirmed(data)
      })
    }
  }

  public async shutdown() {}
}
