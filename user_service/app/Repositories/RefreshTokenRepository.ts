import RefreshToken from 'App/Models/RefreshToken'
import { Hash } from 'App/Security/Hash'
import { RefreshTokenStatus } from 'App/Constants/Status'
import { DateTime } from 'luxon'

export class RefreshTokenRepository {
  public async insertToken(
    userId: string,
    rawToken: string,
    expiresAt: DateTime
  ): Promise<RefreshToken> {
    const tokenHash = Hash.hashToken(rawToken)
    const refreshToken = new RefreshToken()
    refreshToken.fill({
      userId,
      tokenHash,
      expiresAt,
      status: RefreshTokenStatus.ACTIVE,
    })
    await refreshToken.save()
    return refreshToken
  }

  public async findByRawToken(rawToken: string): Promise<RefreshToken | null> {
    const tokenHash = Hash.hashToken(rawToken)
    return await RefreshToken.query().where('token_hash', tokenHash).first()
  }

  public async deleteByRawToken(rawToken: string): Promise<void> {
    const tokenHash = Hash.hashToken(rawToken)
    await RefreshToken.query().where('token_hash', tokenHash).delete()
  }

  public async deleteByUserId(userId: string): Promise<void> {
    await RefreshToken.query().where('user_id', userId).delete()
  }
}
