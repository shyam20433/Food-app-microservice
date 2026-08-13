import { CorsConfig } from '@ioc:Adonis/Core/Cors'

const corsConfig: CorsConfig = {
  enabled: true,
  origin: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
  headers: true,
  exposeHeaders: ['cache-control', 'content-language', 'content-type', 'expires', 'pragma'],
  credentials: true,
  maxAge: 90,
}

export default corsConfig
