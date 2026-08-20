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

async function waitForServer(port, name, timeoutMs = 15000) {
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
  return child
}

async function runValidationTest() {
  console.log('========================================================================')
  console.log('🧪 TESTING QUERY PARAMETER VALIDATION ON GET ENDPOINTS ACROSS ALL 5 SERVICES')
  console.log('   Testing ?page=Abc&limit=seven across Microservices')
  console.log('========================================================================\n')

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

  await waitForServer(USER_PORT, 'User Service')
  await waitForServer(RESTAURANT_PORT, 'Restaurant Service')
  await waitForServer(ORDER_PORT, 'Order Service')
  await waitForServer(PAYMENT_PORT, 'Payment Service')
  await waitForServer(DELIVERY_PORT, 'Delivery Service')

  const uniqueId = Math.floor(100000 + Math.random() * 900000)
  const email = `val_admin_${uniqueId}@example.com`
  const password = 'Password123!'

  console.log('\n1. Authenticating User in User Service...')
  await axios.post(`${USER_URL}/auth/register`, {
    email,
    password,
    name: 'Validator User',
    phone_number: `+9197${uniqueId}00`,
    roles: ['ADMIN'],
  })
  const loginRes = await axios.post(`${USER_URL}/auth/login`, { email, password })
  const token = loginRes.data.data.token || loginRes.data.data.access_token || loginRes.data.data
  const headers = { Authorization: `Bearer ${token}` }

  console.log('\n2. Testing GET /users?page=Abc&limit=seven (User Service)...')
  try {
    await axios.get(`${USER_URL}/users?page=Abc&limit=seven`, { headers })
    throw new Error('Expected 422 Validation Error but request succeeded!')
  } catch (err) {
    if (err.response && err.response.status === 422) {
      console.log('  ✓ User Service properly rejected invalid query params with HTTP 422!')
      console.log('    Response:', JSON.stringify(err.response.data.errors, null, 2))
    } else {
      throw err
    }
  }

  console.log('\n3. Testing GET /restaurants?page=Abc&limit=seven (Restaurant Service)...')
  try {
    await axios.get(`${RESTAURANT_URL}/restaurants?page=Abc&limit=seven`, { headers })
    throw new Error('Expected 422 Validation Error but request succeeded!')
  } catch (err) {
    if (err.response && err.response.status === 422) {
      console.log('  ✓ Restaurant Service properly rejected invalid query params with HTTP 422!')
      console.log('    Response:', JSON.stringify(err.response.data.errors, null, 2))
    } else {
      throw err
    }
  }

  console.log('\n4. Testing GET /orders?page=Abc&limit=seven (Order Service)...')
  try {
    await axios.get(`${ORDER_URL}/orders?page=Abc&limit=seven`, { headers })
    throw new Error('Expected 422 Validation Error but request succeeded!')
  } catch (err) {
    if (err.response && err.response.status === 422) {
      console.log('  ✓ Order Service properly rejected invalid query params with HTTP 422!')
      console.log('    Response:', JSON.stringify(err.response.data.errors, null, 2))
    } else {
      throw err
    }
  }

  console.log('\n5. Testing GET /payments?page=Abc&limit=seven (Payment Service)...')
  try {
    await axios.get(`${PAYMENT_URL}/payments?page=Abc&limit=seven`, { headers })
    throw new Error('Expected 422 Validation Error but request succeeded!')
  } catch (err) {
    if (err.response && err.response.status === 422) {
      console.log('  ✓ Payment Service properly rejected invalid query params with HTTP 422!')
      console.log('    Response:', JSON.stringify(err.response.data.errors, null, 2))
    } else {
      throw err
    }
  }

  console.log('\n6. Testing GET /deliveries?page=Abc&limit=seven (Delivery Service)...')
  try {
    await axios.get(`${DELIVERY_URL}/deliveries?page=Abc&limit=seven`, { headers })
    throw new Error('Expected 422 Validation Error but request succeeded!')
  } catch (err) {
    if (err.response && err.response.status === 422) {
      console.log('  ✓ Delivery Service properly rejected invalid query params with HTTP 422!')
      console.log('    Response:', JSON.stringify(err.response.data.errors, null, 2))
    } else {
      throw err
    }
  }

  console.log('\n========================================================================')
  console.log('🎉 ALL 5 MICROSERVICES GET QUERY VALIDATION VERIFIED 100% SUCCESSFUL!')
  console.log('========================================================================\n')

  if (userProc) userProc.kill()
  if (restProc) restProc.kill()
  if (orderProc) orderProc.kill()
  if (payProc) payProc.kill()
  if (delivProc) delivProc.kill()
  process.exit(0)
}

runValidationTest().catch((err) => {
  console.error('❌ GET Validation test failed:', err.response?.data || err.message)
  if (userProc) userProc.kill()
  if (restProc) restProc.kill()
  if (orderProc) orderProc.kill()
  if (payProc) payProc.kill()
  if (delivProc) delivProc.kill()
  process.exit(1)
})
