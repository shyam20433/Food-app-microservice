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

async function runRouteParamTest() {
  console.log('========================================================================')
  console.log('🧪 TESTING ROUTE PARAMETER (ID) VALIDATION ON GET & SHOW ENDPOINTS')
  console.log('   Testing invalid UUID route parameters (e.g. /users/not-a-uuid)')
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

  await waitForServer(USER_PORT, 'User Service')
  await waitForServer(RESTAURANT_PORT, 'Restaurant Service')

  const uniqueId = Math.floor(100000 + Math.random() * 900000)
  const email = `route_val_${uniqueId}@example.com`
  const password = 'Password123!'

  console.log('\n1. Authenticating User in User Service...')
  await axios.post(`${USER_URL}/auth/register`, {
    email,
    password,
    name: 'Route Validator',
    phone_number: `+9197${uniqueId}00`,
    roles: ['ADMIN'],
  })
  const loginRes = await axios.post(`${USER_URL}/auth/login`, { email, password })
  const token = loginRes.data.data.token || loginRes.data.data.access_token || loginRes.data.data
  const headers = { Authorization: `Bearer ${token}` }

  console.log('\n2. Testing GET /users/not-a-uuid (User Service)...')
  try {
    await axios.get(`${USER_URL}/users/not-a-uuid`, { headers })
    throw new Error('Expected 422 Validation Error but request succeeded!')
  } catch (err) {
    if (err.response && err.response.status === 422) {
      console.log('  ✓ User Service properly rejected invalid UUID parameter with HTTP 422!')
      console.log('    Response Payload:', JSON.stringify(err.response.data.errors, null, 2))
    } else {
      throw err
    }
  }

  console.log('\n3. Testing GET /restaurants/not-a-uuid (Restaurant Service)...')
  try {
    await axios.get(`${RESTAURANT_URL}/restaurants/not-a-uuid`, { headers })
    throw new Error('Expected 422 Validation Error but request succeeded!')
  } catch (err) {
    if (err.response && err.response.status === 422) {
      console.log('  ✓ Restaurant Service properly rejected invalid UUID parameter with HTTP 422!')
      console.log('    Response Payload:', JSON.stringify(err.response.data.errors, null, 2))
    } else {
      throw err
    }
  }

  console.log('\n========================================================================')
  console.log('🎉 ROUTE PARAMETER (UUID) VALIDATION VERIFIED 100% SUCCESSFUL!')
  console.log('========================================================================\n')

  if (userProc) userProc.kill()
  if (restProc) restProc.kill()
  process.exit(0)
}

runRouteParamTest().catch((err) => {
  console.error('❌ Route Param Validation test failed:', err.response?.data || err.message)
  if (userProc) userProc.kill()
  if (restProc) restProc.kill()
  process.exit(1)
})
