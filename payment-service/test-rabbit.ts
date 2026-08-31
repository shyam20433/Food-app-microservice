import { connectRabbitMQ, subscribeToEvent } from './app/Services/RabbitMQService'

async function test() {
  await connectRabbitMQ()

  await subscribeToEvent('test_queue', 'test.event', async (message) => {
    console.log('Message received:')
    console.log(message)
  })
}

test()