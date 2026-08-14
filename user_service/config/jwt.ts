import Env from '@ioc:Adonis/Core/Env'

export const jwtConfig = {
  secret: Env.get('JWT_SECRET', 'super_secret_jwt_key_adonis_user_service'),
  expiresIn: Env.get('JWT_EXPIRES_IN', '15m'),
  refreshTokenExpiresIn: Env.get('REFRESH_TOKEN_EXPIRES_IN', '7d'),
}

export default jwtConfig
