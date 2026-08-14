import { CorsConfig } from '@ioc:Adonis/Core/Cors'
import Env from '@ioc:Adonis/Core/Env'

const corsConfig: CorsConfig = {
  enabled: () => Env.get('NODE_ENV') === 'production',
  origin: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
  headers: true,
  exposeHeaders: [
    'cache-control',
    'content-language',
    'content-type',
    'expires',
    'last-modified',
    'pragma',
  ],
  credentials: true,
  maxAge: 90,
}

export default corsConfig
