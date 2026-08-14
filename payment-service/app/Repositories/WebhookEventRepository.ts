import WebhookEvent from 'App/Models/WebhookEvent'
import { DateTime } from 'luxon'

export class WebhookEventRepository {
  public async findByGatewayAndEventId(
    gateway: string,
    eventId: string,
    options?: any
  ): Promise<WebhookEvent | null> {
    return await WebhookEvent.query(options)
      .where('gateway', gateway)
      .where('event_id', eventId)
      .first()
  }

  public async create(
    data: Partial<WebhookEvent>,
    options?: any
  ): Promise<WebhookEvent> {
    const event = new WebhookEvent()
    event.fill(data)
    if (options?.client) {
      event.useTransaction(options.client)
    }
    await event.save()
    return event
  }

  public async markProcessed(
    id: string,
    status: 'PROCESSED' | 'FAILED' = 'PROCESSED',
    options?: any
  ): Promise<WebhookEvent> {
    const event = await WebhookEvent.find(id, options)
    if (!event) throw new Error('WebhookEvent not found')
    event.status = status
    event.processedAt = DateTime.now()
    if (options?.client) {
      event.useTransaction(options.client)
    }
    await event.save()
    return event
  }
}
