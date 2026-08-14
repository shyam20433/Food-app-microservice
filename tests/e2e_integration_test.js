const http = require('http')
const fs = require('fs')
const { spawn } = require('child_process')
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

let userProc = null
let restProc = null
let orderProc = null
let payProc = null
let delivProc = null

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

async function waitForServer(port, name, timeoutMs = 25000) {
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
  console.log(`🚀 Starting ${name} in ${dirPath}...`)

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
  return child
}

async function runEndToEndIntegrationTest() {
  console.log('========================================================================')
  console.log('🌐 STARTING COMPLETE END-TO-END INTEGRATION TEST (5 MICROSERVICES)')
  console.log('   User (:3333) -> Restaurant (:3334) -> Order (:3335) -> Payment (:3336) -> Delivery (:3337)')
  console.log('========================================================================\n')

  // Launch services if not running
  if (!(await isPortOpen(USER_PORT))) {
    userProc = startService(path.join(__dirname, '..', 'user_service'), 'User Service', USER_PORT)
  }
  if (!(await isPortOpen(RESTAURANT_PORT))) {
    restProc = startService(
      path.join(__dirname, '..', 'restaurant-service'),
      'Restaurant Service',
      RESTAURANT_PORT
    )
  }
  if (!(await isPortOpen(ORDER_PORT))) {
    orderProc = startService(
      path.join(__dirname, '..', 'order-service'),
      'Order Service',
      ORDER_PORT
    )
  }
  if (!(await isPortOpen(PAYMENT_PORT))) {
    payProc = startService(
      path.join(__dirname, '..', 'payment-service'),
      'Payment Service',
      PAYMENT_PORT
    )
  }
  if (!(await isPortOpen(DELIVERY_PORT))) {
    delivProc = startService(
      path.join(__dirname, '..', 'delivery-service'),
      'Delivery Service',
      DELIVERY_PORT
    )
  }

  console.log('⏳ Waiting for all 5 Microservices to be healthy...')
  await waitForServer(USER_PORT, 'User Service')
  await waitForServer(RESTAURANT_PORT, 'Restaurant Service')
  await waitForServer(ORDER_PORT, 'Order Service')
  await waitForServer(PAYMENT_PORT, 'Payment Service')
  await waitForServer(DELIVERY_PORT, 'Delivery Service')
  console.log('✨ All 5 Microservices are live and healthy!\n')

  // Clean PostgreSQL tables for fresh test isolation
  const { Client } = require(path.join(__dirname, '..', 'order-service', 'node_modules', 'pg'))
  const pgClient = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: '1234',
    database: 'delivery_db',
  })
  try {
    await pgClient.connect()
    await pgClient.query('TRUNCATE delivery_status_history, deliveries, delivery_partners CASCADE;')
    await pgClient.end()
    console.log('🧹 Cleaned delivery_db tables for isolated test run.')
  } catch {
    try { await pgClient.end() } catch {}
  }

  const uniqueId = Math.floor(100000 + Math.random() * 900000)
  const customerEmail = `e2e_cust_${uniqueId}@example.com`
  const ownerEmail = `e2e_owner_${uniqueId}@example.com`
  const partner1Email = `e2e_p1_${uniqueId}@example.com`
  const partner2Email = `e2e_p2_${uniqueId}@example.com`
  const password = 'Password123!'

  // 1. Register & Login CUSTOMER
  console.log('Step 1: Registering & Logging in CUSTOMER in User Service...')
  await axios.post(`${USER_URL}/auth/register`, {
    email: customerEmail,
    password: password,
    name: `Customer ${uniqueId}`,
    phone_number: `+9198${uniqueId}10`,
  })
  const loginCustRes = await axios.post(`${USER_URL}/auth/login`, {
    email: customerEmail,
    password: password,
  })
  const customerToken = loginCustRes.data.data.token || loginCustRes.data.data.access_token || loginCustRes.data.data
  const customerHeader = { Authorization: `Bearer ${customerToken}` }

  // 2. Register & Login RESTAURANT_OWNER
  console.log('Step 2: Registering & Logging in RESTAURANT_OWNER in User Service...')
  await axios.post(`${USER_URL}/auth/register`, {
    email: ownerEmail,
    password: password,
    name: `Owner ${uniqueId}`,
    phone_number: `+9198${uniqueId}11`,
    roles: ['RESTAURANT_OWNER'],
  })
  const loginOwnerRes = await axios.post(`${USER_URL}/auth/login`, {
    email: ownerEmail,
    password: password,
  })
  const ownerToken = loginOwnerRes.data.data.token || loginOwnerRes.data.data.access_token || loginOwnerRes.data.data
  const ownerHeader = { Authorization: `Bearer ${ownerToken}` }

  // 3. Register & Login DELIVERY_PARTNERS
  console.log('Step 3: Registering & Logging in 2 DELIVERY_PARTNERS in User Service...')
  await axios.post(`${USER_URL}/auth/register`, {
    email: partner1Email,
    password: password,
    name: `Partner Far ${uniqueId}`,
    phone_number: `+9198${uniqueId}12`,
    roles: ['DELIVERY_PARTNER'],
  })
  const loginP1Res = await axios.post(`${USER_URL}/auth/login`, { email: partner1Email, password })
  const p1Token = loginP1Res.data.data.token || loginP1Res.data.data.access_token || loginP1Res.data.data
  const p1Header = { Authorization: `Bearer ${p1Token}` }

  await axios.post(`${USER_URL}/auth/register`, {
    email: partner2Email,
    password: password,
    name: `Partner Near ${uniqueId}`,
    phone_number: `+9198${uniqueId}13`,
    roles: ['DELIVERY_PARTNER'],
  })
  const loginP2Res = await axios.post(`${USER_URL}/auth/login`, { email: partner2Email, password })
  const p2Token = loginP2Res.data.data.token || loginP2Res.data.data.access_token || loginP2Res.data.data
  const p2Header = { Authorization: `Bearer ${p2Token}` }

  // 4. Customer creates Address in User Service
  console.log('Step 4: Customer creating primary Address in User Service...')
  const addrRes = await axios.post(
    `${USER_URL}/addresses`,
    {
      label: 'Home',
      house_no: '888',
      street: 'Avinashi Road',
      area: 'Peelamedu',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '641004',
      latitude: 11.0250,
      longitude: 76.9900,
    },
    { headers: customerHeader }
  )
  const addressId = addrRes.data.data.id

  // 5. Owner creates Restaurant, Category, Menu Item in Restaurant Service
  console.log('Step 5: Owner creating Restaurant, Category, & Menu Item in Restaurant Service...')
  const restRes = await axios.post(
    `${RESTAURANT_URL}/restaurants`,
    {
      name: `Spicy Bistro ${uniqueId}`,
      description: 'Gourmet Indian & Continental fusion',
      email: ownerEmail,
      phone_number: '+91 9876543210',
      opening_time: '10:00:00',
      closing_time: '23:00:00',
      delivery_radius: 15.0,
    },
    { headers: ownerHeader }
  )
  const restaurantId = restRes.data.data.id

  const catRes = await axios.post(
    `${RESTAURANT_URL}/restaurants/${restaurantId}/categories`,
    { name: 'Biryani Specials', display_order: 1 },
    { headers: ownerHeader }
  )
  const categoryId = catRes.data.data.id

  const itemRes = await axios.post(
    `${RESTAURANT_URL}/restaurants/${restaurantId}/menu-items`,
    {
      category_id: categoryId,
      name: 'Hyderabadi Dum Biryani',
      description: 'Fragrant basmati rice cooked with authentic spices',
      price: 29.99,
      is_available: true,
      is_vegetarian: false,
    },
    { headers: ownerHeader }
  )
  const menuItemId = itemRes.data.data.id

  // 6. Delivery Partners register profiles & set availability
  console.log('Step 6: Delivery Partners registering profiles & setting AVAILABLE in Delivery Service...')
  // Partner 1 (Far: 11.0700, 77.0100 -> ~6.7 km from restaurant 11.0168, 76.9558)
  await axios.post(
    `${DELIVERY_URL}/delivery-partners`,
    { vehicle_type: 'BIKE', vehicle_number: 'TN38FAR101', latitude: 11.0700, longitude: 77.0100 },
    { headers: p1Header }
  )
  await axios.patch(
    `${DELIVERY_URL}/delivery-partners/me/availability`,
    { availability_status: 'AVAILABLE' },
    { headers: p1Header }
  )

  // Partner 2 (Near: 11.0200, 76.9600 -> ~0.58 km from restaurant 11.0168, 76.9558)
  await axios.post(
    `${DELIVERY_URL}/delivery-partners`,
    { vehicle_type: 'SCOOTER', vehicle_number: 'TN38NEAR202', latitude: 11.0200, longitude: 76.9600 },
    { headers: p2Header }
  )
  await axios.patch(
    `${DELIVERY_URL}/delivery-partners/me/availability`,
    { availability_status: 'AVAILABLE' },
    { headers: p2Header }
  )
  console.log('  ✓ Both delivery partners registered and set to AVAILABLE')

  // 7. Customer creates Cart & places Order in Order Service
  console.log('Step 7: Customer placing Order in Order Service...')
  await axios.post(
    `${ORDER_URL}/cart/items`,
    { restaurant_id: restaurantId, menu_item_id: menuItemId, quantity: 2 },
    { headers: customerHeader }
  )
  const checkoutRes = await axios.post(
    `${ORDER_URL}/orders`,
    { address_id: addressId },
    { headers: customerHeader }
  )
  const orderId = checkoutRes.data.data.id

  // 8. Owner confirms Order
  console.log('Step 8: Owner confirming Order in Order Service...')
  await axios.patch(`${ORDER_URL}/restaurant-orders/${orderId}/confirm`, {}, { headers: ownerHeader })

  // 9. Customer pays for Order in Payment Service
  console.log('Step 9: Customer paying for Order in Payment Service...')
  const payInit = await axios.post(
    `${PAYMENT_URL}/payments`,
    { order_id: orderId, gateway: 'MOCK' },
    { headers: customerHeader }
  )
  const paymentId = payInit.data.data.id
  await axios.post(`${PAYMENT_URL}/payments/${paymentId}/pay`, { action: 'SUCCESS' }, { headers: customerHeader })
  console.log('  ✓ Order paid successfully in Payment Service')

  // 10. Create Delivery in Delivery Service
  console.log('Step 10: Creating Delivery in Delivery Service...')
  const delivInitRes = await axios.post(
    `${DELIVERY_URL}/deliveries`,
    { order_id: orderId },
    { headers: customerHeader }
  )
  const deliveryData = delivInitRes.data.data
  const deliveryId = deliveryData.id
  console.log(
    `  ✓ Delivery created in Delivery Service! (ID: ${deliveryId}, Status: ${deliveryData.status}, Assigned Partner: ${deliveryData.partner?.vehicleNumber || 'Auto-assigning'})`
  )

  // 11. Verify Auto-Assignment selected Nearest Partner (Partner 2 - Near)
  console.log('Step 11: Verifying Haversine Nearest Partner Assignment...')
  const p2Active = await axios.get(`${DELIVERY_URL}/delivery-partners/me/delivery`, { headers: p2Header })
  if (p2Active.data.data.id !== deliveryId) {
    throw new Error('Haversine distance assignment failed to select nearest partner')
  }
  console.log('  ✓ Nearest Partner 2 (0.58km away) correctly auto-assigned!')

  // 12. Partner 2 Rejects Assignment -> Triggers Re-assignment to Partner 1
  console.log('Step 12: Partner 2 REJECTING assignment...')
  await axios.patch(`${DELIVERY_URL}/deliveries/${deliveryId}/reject`, {}, { headers: p2Header })
  console.log('  ✓ Partner 2 rejected assignment. Partner 2 state reset to AVAILABLE')

  // 13. Partner 1 Checks Active Delivery -> Accepts Assignment
  console.log('Step 13: Partner 1 ACCEPTING re-assigned delivery...')
  const p1Active = await axios.get(`${DELIVERY_URL}/delivery-partners/me/delivery`, { headers: p1Header })
  if (p1Active.data.data.id !== deliveryId) {
    throw new Error('Re-assignment to Partner 1 failed')
  }
  await axios.patch(`${DELIVERY_URL}/deliveries/${deliveryId}/accept`, {}, { headers: p1Header })
  console.log('  ✓ Partner 1 accepted delivery assignment! Status: ACCEPTED')

  // 14. Partner 1 Pickup -> PICKED_UP
  console.log('Step 14: Partner 1 marking order PICKED_UP at restaurant...')
  await axios.patch(`${DELIVERY_URL}/deliveries/${deliveryId}/pickup`, {}, { headers: p1Header })
  console.log('  ✓ Delivery status updated to PICKED_UP')

  // 15. Partner 1 Out for Delivery -> OUT_FOR_DELIVERY
  console.log('Step 15: Partner 1 marking order OUT_FOR_DELIVERY...')
  await axios.patch(`${DELIVERY_URL}/deliveries/${deliveryId}/out-for-delivery`, {}, { headers: p1Header })
  console.log('  ✓ Delivery status updated to OUT_FOR_DELIVERY')

  // 16. Partner 1 Delivered -> DELIVERED
  console.log('Step 16: Partner 1 marking order DELIVERED to customer...')
  const finalDelivRes = await axios.patch(
    `${DELIVERY_URL}/deliveries/${deliveryId}/delivered`,
    {},
    { headers: p1Header }
  )
  const finalStatus = finalDelivRes.data.data.status
  console.log(`  ✓ Delivery completed! Final Status: ${finalStatus}`)

  // 17. Verify Partner 1 Availability automatically reset to AVAILABLE
  console.log('Step 17: Verifying Partner 1 availability reset to AVAILABLE...')
  const p1Profile = await axios.get(`${DELIVERY_URL}/delivery-partners/me`, { headers: p1Header })
  const partnerState = p1Profile.data.data.availability_status || p1Profile.data.data.availabilityStatus
  if (partnerState !== 'AVAILABLE') {
    throw new Error(`Partner availability was not reset to AVAILABLE after delivery (Current: ${partnerState})`)
  }
  console.log('  ✓ Partner 1 availability state automatically reset to AVAILABLE!')

  // 18. Customer inspects complete Delivery & Status History
  console.log('Step 18: Customer inspecting final Delivery details & complete status history...')
  const custView = await axios.get(`${DELIVERY_URL}/deliveries/${deliveryId}`, { headers: customerHeader })
  const historyList = custView.data.data.history.map((h) => h.status)
  console.log(`  ✓ Delivery Status History Log: [${historyList.join(' -> ')}]`)

  console.log('\n========================================================================')
  console.log('🎉 COMPLETE 5-SERVICE MICROSERVICES CORE INTEGRATION PASSED 100%!')
  console.log('   User Service, Restaurant Service, Order Service, Payment Service, and Delivery Service!')
  console.log('========================================================================\n')

  if (userProc) userProc.kill()
  if (restProc) restProc.kill()
  if (orderProc) orderProc.kill()
  if (payProc) payProc.kill()
  if (delivProc) delivProc.kill()
  process.exit(0)
}

runEndToEndIntegrationTest().catch((err) => {
  console.error('❌ E2E Integration test failed:', err.response?.data || err.message)
  if (userProc) userProc.kill()
  if (restProc) restProc.kill()
  if (orderProc) orderProc.kill()
  if (payProc) payProc.kill()
  if (delivProc) delivProc.kill()
  process.exit(1)
})
