import Env from '@ioc:Adonis/Core/Env'

export const jwtConfig = {
  secret: Env.get('JWT_SECRET', 'super_secret_jwt_key_adonis_user_service'),
}

export default jwtConfig
