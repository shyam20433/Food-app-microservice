import amqp, { ChannelModel, Channel } from 'amqplib'
import Env from '@ioc:Adonis/Core/Env'
import EventEmitter from 'events'

const localBus = new EventEmitter()
localBus.setMaxListeners(100)

let connection: ChannelModel | null = null
let channel: Channel | null = null
let isConnected = false

const EXCHANGE_NAME = 'food_app_exchange'
const EXCHANGE_TYPE = 'topic'

export async function connectRabbitMQ(): Promise<Channel | null> {
  if (channel) return channel

  try {
    const rabbitUrl = Env.get('RABBITMQ_URL', 'amqp://admin:admin123@127.0.0.1:5672')
    connection = await amqp.connect(rabbitUrl)
    channel = await connection.createChannel()
    await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, { durable: true })
    isConnected = true
    console.log(`[RabbitMQ] Connected to exchange "${EXCHANGE_NAME}"`)
    return channel
  } catch (error) {
    isConnected = false
    console.warn(`[RabbitMQ] Connection unavailable (${(error as Error).message}). Using internal event bus fallback.`)
    return null
  }
}

export async function publishEvent(routingKey: string, message: object): Promise<boolean> {
  try {
    const ch = await connectRabbitMQ()
    if (ch && isConnected) {
      const published = ch.publish(
        EXCHANGE_NAME,
        routingKey,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      )
      console.log(`[RabbitMQ] Published event "${routingKey}" to exchange "${EXCHANGE_NAME}"`)
      return published
    }
  } catch (error) {
    console.error(`[RabbitMQ] Publish error for "${routingKey}":`, error)
  }

  // Fallback: emit on in-memory Event Bus
  console.log(`[EventBus] Emitted event "${routingKey}" via internal fallback`)
  localBus.emit(routingKey, message)
  return true
}

export async function subscribeToEvent(
  queueName: string,
  routingKey: string,
  handler: (data: any) => Promise<void>
): Promise<void> {
  localBus.on(routingKey, async (data) => {
    try {
      await handler(data)
    } catch (err) {
      console.error(`[EventBus] Error handling event "${routingKey}":`, err)
    }
  })

  try {
    const ch = await connectRabbitMQ()
    if (ch && isConnected) {
      await ch.assertQueue(queueName, { durable: true })
      await ch.bindQueue(queueName, EXCHANGE_NAME, routingKey)
      console.log(`[RabbitMQ] Queue "${queueName}" subscribed to routing key "${routingKey}"`)

      await ch.consume(queueName, async (msg) => {
        if (!msg) return

        try {
          const data = JSON.parse(msg.content.toString())
          console.log(`[RabbitMQ] Received message on queue "${queueName}" (${msg.fields.routingKey})`)
          await handler(data)
          ch.ack(msg)
        } catch (err) {
          console.error(`[RabbitMQ] Error handling message on queue "${queueName}":`, err)
          ch.nack(msg, false, false)
        }
      })
      return
    }
  } catch (error) {
    console.warn(`[RabbitMQ] Queue "${queueName}" falling back to internal event listener`)
  }
}