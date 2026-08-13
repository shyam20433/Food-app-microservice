import Env from '@ioc:Adonis/Core/Env'
import { HashConfig } from '@ioc:Adonis/Core/Hash'

const hashConfig: HashConfig = {
  default: Env.get('HASH_DRIVER', 'argon2'),
  list: {
    argon2: {
      driver: 'argon2',
      variant: 'id',
      iterations: 3,
      memory: 4096,
      parallelism: 1,
    },
    bcrypt: {
      driver: 'bcrypt',
      rounds: 10,
    },
  },
}

export default hashConfig
