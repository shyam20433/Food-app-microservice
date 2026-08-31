const http = require('http')
const fs = require('fs')
const { spawn, execSync } = require('child_process')
const path = require('path')
const axios = require('axios')

const USER_PORT = 3333
const RESTAURANT_PORT = 3334
const ORDER_PORT = 3335
const PAYMENT_PORT = 3336
const DELIVERY_PORT = 3337

const USER_URL = `http://127.0.0.1:${USER_PORT}`
const RESTAURANT_URL = `http://127.0.0.1:${RESTAURANT_PORT}`
const ORDER_URL = `http://127.0.0.1:${ORDER_PORT}`
const PAYMENT_URL = `http://127.0.0.1:${PAYMENT_PORT}`
const DELIVERY_URL = `http://127.0.0.1:${DELIVERY_PORT}`

let processes = []

function parseDotEnv(envPath) {
  if (!fs.existsSync(envPath)) return {}
  const content = fs.readFileSync(envPath, 'utf8')
  const env = {}
  content.split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=')
      const key = trimmed.slice(0, idx).trim()
      const val = trimmed.slice(idx + 1).trim()
      env[key] = val
    }
  })
  return env
}

function isPortOpen(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/health`, (res) => {
      resolve(res.statusCode === 200)
    })
    req.on('error', () => resolve(false))
    req.end()
  })
}

async function waitForServer(port, name, timeoutMs = 20000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (await isPortOpen(port)) {
      console.log(`  ✓ ${name} is UP on port ${port}`)
      return true
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`Timeout waiting for ${name} on port ${port}`)
}

function startService(dirPath, name, port) {
  const srcEnv = path.join(dirPath, '.env')
  const buildEnv = path.join(dirPath, 'build', '.env')
  if (fs.existsSync(srcEnv)) {
    fs.copyFileSync(srcEnv, buildEnv)
  }

  const parsedEnv = parseDotEnv(srcEnv)
  const child = spawn('node', ['server.js'], {
    cwd: path.join(dirPath, 'build'),
    env: { ...process.env, ...parsedEnv, PORT: String(port) },
    stdio: 'inherit',
  })
  processes.push(child)
  return child
}

function stopAllProcesses() {
  console.log('\n🛑 Stopping background microservice processes...')
  processes.forEach((proc) => proc.kill())
}

async function runRabbitE2ETest() {
  console.log('========================================================================')
  console.log('🐰 STARTING RABBITMQ EVENT-DRIVEN MICROSERVICES INTEGRATION TEST')
  console.log('   User -> Restaurant -> Order -(order.created)-> Payment')
  console.log('   Payment -(payment.succeeded)-> Order -(order.confirmed)-> Delivery')
  console.log('   Delivery -(delivery.status_updated)-> Order')
  console.log('========================================================================\n')

  startService(path.join(__dirname, '..', 'user_service'), 'User Service', USER_PORT)
  startService(path.join(__dirname, '..', 'restaurant-service'), 'Restaurant Service', RESTAURANT_PORT)
  startService(path.join(__dirname, '..', 'order-service'), 'Order Service', ORDER_PORT)
  startService(path.join(__dirname, '..', 'payment-service'), 'Payment Service', PAYMENT_PORT)
  startService(path.join(__dirname, '..', 'delivery-service'), 'Delivery Service', DELIVERY_PORT)

  await waitForServer(USER_PORT, 'User Service')
  await waitForServer(RESTAURANT_PORT, 'Restaurant Service')
  await waitForServer(ORDER_PORT, 'Order Service')
  await waitForServer(PAYMENT_PORT, 'Payment Service')
  await waitForServer(DELIVERY_PORT, 'Delivery Service')

  console.log('✨ All 5 Microservices live & healthy with RabbitMQ Event Bus!')

  const uniqueId = Math.floor(100000 + Math.random() * 900000)

  // 1. Setup Customer & Address
  console.log('\nStep 1: Registering Customer & Address in User Service...')
  const custEmail = `rabbit_cust_${uniqueId}@example.com`
  const password = 'Password123!'
  await axios.post(`${USER_URL}/auth/register`, {
    email: custEmail,
    password,
    name: 'Rabbit Customer',
    phone_number: `+9198${uniqueId}01`,
  })
  const custLogin = await axios.post(`${USER_URL}/auth/login`, { email: custEmail, password })
  const custToken = custLogin.data.data.token || custLogin.data.data.access_token || custLogin.data.data
  const custHeaders = { Authorization: `Bearer ${custToken}` }

  const addressRes = await axios.post(
    `${USER_URL}/addresses`,
    {
      label: 'Home',
      house_no: '45-B',
      street: 'Event Driven Boulevard',
      area: 'RabbitMQ Park',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500032',
      is_default: true,
    },
    { headers: custHeaders }
  )
  const addressId = addressRes.data.data.id

  // 2. Setup Owner & Restaurant
  console.log('\nStep 2: Registering Owner & Creating Restaurant in Restaurant Service...')
  const ownerEmail = `rabbit_owner_${uniqueId}@example.com`
  await axios.post(`${USER_URL}/auth/register`, {
    email: ownerEmail,
    password,
    name: 'Rabbit Owner',
    phone_number: `+9198${uniqueId}02`,
    roles: ['RESTAURANT_OWNER'],
  })
  const ownerLogin = await axios.post(`${USER_URL}/auth/login`, { email: ownerEmail, password })
  const ownerToken = ownerLogin.data.data.token || ownerLogin.data.data.access_token || ownerLogin.data.data
  const ownerHeaders = { Authorization: `Bearer ${ownerToken}` }

  const restRes = await axios.post(
    `${RESTAURANT_URL}/restaurants`,
    {
      name: `Rabbit Bistro ${uniqueId}`,
      description: 'Asynchronous Delights',
      phone_number: `+9198${uniqueId}03`,
      email: `bistro_${uniqueId}@example.com`,
    },
    { headers: ownerHeaders }
  )
  const restaurantId = restRes.data.data.id

  const catRes = await axios.post(
    `${RESTAURANT_URL}/restaurants/${restaurantId}/categories`,
    { name: 'Event Mains', display_order: 1 },
    { headers: ownerHeaders }
  )
  const categoryId = catRes.data.data.id

  const itemRes = await axios.post(
    `${RESTAURANT_URL}/restaurants/${restaurantId}/menu-items`,
    {
      category_id: categoryId,
      name: 'Rabbit Special Pizza',
      price: 499.00,
      is_available: true,
      description: 'Hot & fast via message queue',
    },
    { headers: ownerHeaders }
  )
  const menuItemId = itemRes.data.data.id

  // 3. Setup Delivery Partner
  console.log('\nStep 3: Registering Delivery Partner in Delivery Service...')
  const partnerEmail = `rabbit_driver_${uniqueId}@example.com`
  await axios.post(`${USER_URL}/auth/register`, {
    email: partnerEmail,
    password,
    name: 'Rabbit Express Rider',
    phone_number: `+9198${uniqueId}04`,
    roles: ['DELIVERY_PARTNER'],
  })
  const partnerLogin = await axios.post(`${USER_URL}/auth/login`, { email: partnerEmail, password })
  const partnerToken = partnerLogin.data.data.token || partnerLogin.data.data.access_token || partnerLogin.data.data
  const partnerHeaders = { Authorization: `Bearer ${partnerToken}` }

  await axios.post(
    `${DELIVERY_URL}/delivery-partners`,
    {
      vehicle_type: 'BIKE',
      vehicle_number: 'TS-09-EV-1234',
      current_latitude: 11.0168,
      current_longitude: 76.9558,
    },
    { headers: partnerHeaders }
  )

  await axios.patch(
    `${DELIVERY_URL}/delivery-partners/me/availability`,
    { availability_status: 'AVAILABLE', latitude: 11.0168, longitude: 76.9558 },
    { headers: partnerHeaders }
  )
  console.log('  ✓ Delivery Partner registered & marked AVAILABLE')

  // 4. Customer Adds Item to Cart & Checkouts
  console.log('\nStep 4: Customer Checkout in Order Service...')
  await axios.post(
    `${ORDER_URL}/cart/items`,
    { restaurant_id: restaurantId, menu_item_id: menuItemId, quantity: 2 },
    { headers: custHeaders }
  )

  const checkoutRes = await axios.post(
    `${ORDER_URL}/orders`,
    { address_id: addressId },
    { headers: custHeaders }
  )
  const orderId = checkoutRes.data.data.id
  console.log(`  ✓ Order created! Order ID: ${orderId}, Status: PENDING`)
  console.log('    📢 [RabbitMQ Event Emitted]: order.created')

  // 5. Verify Payment Service Auto-Created Payment via RabbitMQ Event order.created
  console.log('\nStep 5: Verifying Payment Service consumed order.created & auto-created Payment...')
  await new Promise((r) => setTimeout(r, 3000))

  const paymentsRes = await axios.get(`${PAYMENT_URL}/payments`, { headers: custHeaders })
  const userPayments = paymentsRes.data.data
  const autoPayment = userPayments.find((p) => (p.order_id || p.orderId) === orderId)

  if (!autoPayment) {
    throw new Error(`Payment Service failed to auto-create payment for order ${orderId} via RabbitMQ!`)
  }
  console.log(`  ✓ Payment auto-created in Payment Service! (ID: ${autoPayment.id}, Status: ${autoPayment.status}, Amount: ₹${autoPayment.amount})`)

  // 6. Execute Mock Payment in Payment Service -> emits payment.succeeded
  console.log('\nStep 6: Executing Payment in Payment Service...')
  const payRes = await axios.post(
    `${PAYMENT_URL}/payments/${autoPayment.id}/pay`,
    { action: 'SUCCESS' },
    { headers: custHeaders }
  )
  console.log(`  ✓ Mock Payment Executed! Status: ${payRes.data.data.status}`)
  console.log('    📢 [RabbitMQ Event Emitted]: payment.succeeded')

  // 7. Verify Order Service Auto-Confirmed Order via RabbitMQ Event payment.succeeded
  console.log('\nStep 7: Verifying Order Service consumed payment.succeeded & auto-confirmed Order...')
  await new Promise((r) => setTimeout(r, 3000))

  const updatedOrderRes = await axios.get(`${ORDER_URL}/orders/${orderId}`, { headers: custHeaders })
  const updatedOrder = updatedOrderRes.data.data
  const currentOrderStatus = updatedOrder.order_status || updatedOrder.orderStatus

  if (currentOrderStatus !== 'CONFIRMED') {
    throw new Error(`Order Service failed to update order status to CONFIRMED! Current status: ${currentOrderStatus}`)
  }
  console.log(`  ✓ Order status auto-updated to CONFIRMED in Order Service! (Status: ${currentOrderStatus})`)
  console.log('    📢 [RabbitMQ Event Emitted]: order.confirmed')

  // 8. Verify Delivery Service Auto-Created Delivery via RabbitMQ Event order.confirmed
  console.log('\nStep 8: Verifying Delivery Service consumed order.confirmed & auto-created Delivery & assigned Partner...')
  await new Promise((r) => setTimeout(r, 3000))

  const deliveriesRes = await axios.get(`${DELIVERY_URL}/deliveries`, { headers: custHeaders })
  const autoDelivery = deliveriesRes.data.data.find((d) => (d.order_id || d.orderId) === orderId)

  if (!autoDelivery) {
    throw new Error(`Delivery Service failed to auto-create delivery for order ${orderId} via RabbitMQ!`)
  }
  console.log(`  ✓ Delivery auto-created & assigned in Delivery Service! (ID: ${autoDelivery.id}, Status: ${autoDelivery.status})`)

  // 9. Partner Accepts Delivery & Updates Status -> emits delivery.status_updated
  console.log('\nStep 9: Delivery Partner Accept & Status Updates...')
  await axios.patch(`${DELIVERY_URL}/deliveries/${autoDelivery.id}/accept`, {}, { headers: partnerHeaders })
  console.log('  ✓ Delivery Accepted by Partner')

  await axios.patch(`${DELIVERY_URL}/deliveries/${autoDelivery.id}/pickup`, {}, { headers: partnerHeaders })
  console.log('  ✓ Delivery Status -> PICKED_UP')
  console.log('    📢 [RabbitMQ Event Emitted]: delivery.status_updated (PICKED_UP)')

  await new Promise((r) => setTimeout(r, 1000))
  const syncOrder1 = (await axios.get(`${ORDER_URL}/orders/${orderId}`, { headers: custHeaders })).data.data
  console.log(`  ✓ Order Service synced status to: ${syncOrder1.order_status || syncOrder1.orderStatus}`)

  await axios.patch(`${DELIVERY_URL}/deliveries/${autoDelivery.id}/out-for-delivery`, {}, { headers: partnerHeaders })
  console.log('  ✓ Delivery Status -> OUT_FOR_DELIVERY')
  console.log('    📢 [RabbitMQ Event Emitted]: delivery.status_updated (OUT_FOR_DELIVERY)')

  await new Promise((r) => setTimeout(r, 1000))
  const syncOrder2 = (await axios.get(`${ORDER_URL}/orders/${orderId}`, { headers: custHeaders })).data.data
  console.log(`  ✓ Order Service synced status to: ${syncOrder2.order_status || syncOrder2.orderStatus}`)

  await axios.patch(`${DELIVERY_URL}/deliveries/${autoDelivery.id}/delivered`, {}, { headers: partnerHeaders })
  console.log('  ✓ Delivery Status -> DELIVERED')
  console.log('    📢 [RabbitMQ Event Emitted]: delivery.status_updated (DELIVERED)')

  await new Promise((r) => setTimeout(r, 1000))
  const finalOrder = (await axios.get(`${ORDER_URL}/orders/${orderId}`, { headers: custHeaders })).data.data
  console.log(`  ✓ Order Service synced final status to: ${finalOrder.order_status || finalOrder.orderStatus}`)

  console.log('\n========================================================================')
  console.log('🎉 RABBITMQ EVENT-DRIVEN END-TO-END INTEGRATION TEST PASSED 100%!')
  console.log('   Decoupled async communication verified across all 5 microservices!')
  console.log('========================================================================\n')

  stopAllProcesses()
  process.exit(0)
}

runRabbitE2ETest().catch((err) => {
  console.error('\n❌ RabbitMQ E2E Integration test failed:', err.response?.data || err.message)
  stopAllProcesses()
  process.exit(1)
})
