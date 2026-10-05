import amqp, { ChannelModel, Channel } from 'amqplib'
import Env from '@ioc:Adonis/Core/Env'
import EventEmitter from 'events'

export const localBus = new EventEmitter()
localBus.setMaxListeners(100)

let connection: ChannelModel | null = null
let channel: Channel | null = null
let isConnected = false

const EXCHANGE_NAME = 'food_app_exchange'
const EXCHANGE_TYPE = 'topic'
const DLX_EXCHANGE = 'food_app_dlx'

export async function connectRabbitMQ(): Promise<Channel | null> {
  if (channel) return channel

  try {
    const rabbitUrl = Env.get('RABBITMQ_URL', 'amqp://admin:admin123@127.0.0.1:5672')
    connection = await amqp.connect(rabbitUrl)
    channel = await connection.createChannel()
    await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, { durable: true })
    isConnected = true
    console.log(`[RabbitMQ] Payment Service connected to exchange "${EXCHANGE_NAME}"`)
    return channel
  } catch (error) {
    isConnected = false
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

  console.log(`[EventBus] Emitted event "${routingKey}" via localBus`)
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
      const dlqName = `${queueName}.dlq`

      // 1. Assert the Dead Letter Exchange
      await ch.assertExchange(DLX_EXCHANGE, 'direct', { durable: true })  //post office handles only rejected items (dead letter queue)

      // 2. Assert the DLQ and bind it to the DLX
      await ch.assertQueue(dlqName, { durable: true }) //create a reject main bin
      await ch.bindQueue(dlqName, DLX_EXCHANGE, queueName) //connect the post office and the above bin 

      // 3. Assert the main queue with x-dead-letter-exchange pointing to DLX
      await ch.assertQueue(queueName, { //if any rejected bin comes in forward to the dead letter queue
        durable: true,
        arguments: {
          'x-dead-letter-exchange': DLX_EXCHANGE,
          'x-dead-letter-routing-key': queueName,
        },
      })

      await ch.bindQueue(queueName, EXCHANGE_NAME, routingKey)
      console.log(`[RabbitMQ] Queue "${queueName}" subscribed to routing key "${routingKey}" | DLQ: "${dlqName}"`)

      // 4. Consume main queue — nack automatically routes to DLQ
      await ch.consume(queueName, async (msg) => {
        if (!msg) return

        try {
          const data = JSON.parse(msg.content.toString())
          console.log(`[RabbitMQ] Received message on queue "${queueName}" (${msg.fields.routingKey})`)
          await handler(data)
          ch.ack(msg)
        } catch (err) {
          console.error(`[RabbitMQ] Handler failed on queue "${queueName}" — routing to DLQ "${dlqName}":`, err)
          ch.nack(msg, false, false) // requeue=false → goes to DLX → DLQ
        }
      })

      // 5. Consume DLQ — log dead letters for visibility / alerting
      await ch.consume(dlqName, async (msg) => {
        if (!msg) return
        try {
          const data = JSON.parse(msg.content.toString())
          const deathInfo = msg.properties.headers?.['x-death']?.[0]
          console.error(
            `[DLQ] 💀 Dead letter on "${dlqName}" | reason: ${deathInfo?.reason ?? 'unknown'} | routing-key: ${deathInfo?.['routing-keys']?.[0] ?? routingKey}`,
            data
          )
        } catch (_) {}
        ch.ack(msg) // ack to remove from DLQ after logging
      })

      return
    }
  } catch (error) {
    console.warn(`[RabbitMQ] Queue "${queueName}" falling back to internal event listener`)
  }
}