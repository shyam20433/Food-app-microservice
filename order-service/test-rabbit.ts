import { connectRabbitMQ, publishEvent } from './app/Services/RabbitMQService'

async function test() {
  await connectRabbitMQ()
  await publishEvent('test.event', { message: 'hello rabbitmq' })
}

test()