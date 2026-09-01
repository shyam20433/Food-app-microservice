const { spawn, execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const SERVICES = [
  { name: 'User Service', dir: 'user_service', port: 3333 },
  { name: 'Restaurant Service', dir: 'restaurant-service', port: 3334 },
  { name: 'Order Service', dir: 'order-service', port: 3335 },
  { name: 'Payment Service', dir: 'payment-service', port: 3336 },
  { name: 'Delivery Service', dir: 'delivery-service', port: 3337 },
]

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

const processes = []

function stopAll() {
  console.log('\n🛑 Stopping all 5 microservices...')
  processes.forEach((proc) => {
    if (proc && !proc.killed) {
      proc.kill()
    }
  })
  process.exit(0)
}

process.on('SIGINT', stopAll)
process.on('SIGTERM', stopAll)

console.log('========================================================================')
console.log('🚀 STARTING ALL 5 FOOD DELIVERY MICROSERVICES AT THE SAME TIME')
console.log('========================================================================\n')

SERVICES.forEach((service) => {
  const serviceDir = path.join(__dirname, service.dir)
  const buildDir = path.join(serviceDir, 'build')

  if (!fs.existsSync(buildDir)) {
    console.log(`🔨 Building ${service.name}...`)
    try {
      execSync('node ace build', { cwd: serviceDir, stdio: 'inherit' })
    } catch (err) {
      console.error(`❌ Failed to build ${service.name}`)
    }
  }

  const srcEnv = path.join(serviceDir, '.env')
  const buildEnv = path.join(buildDir, '.env')
  if (fs.existsSync(srcEnv) && fs.existsSync(buildDir)) {
    fs.copyFileSync(srcEnv, buildEnv)
  }

  const envVars = parseDotEnv(srcEnv)

  console.log(`▶ Launching ${service.name} on http://127.0.0.1:${service.port}...`)

  const child = spawn('node', ['server.js'], {
    cwd: buildDir,
    env: { ...process.env, ...envVars, PORT: String(service.port) },
    stdio: 'inherit',
  })

  processes.push(child)
})

console.log('\n✨ All 5 microservices launched successfully! Press Ctrl+C to stop all services.\n')
