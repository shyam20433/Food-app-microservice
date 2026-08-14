import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import RefreshToken from 'App/Models/RefreshToken'
import { RefreshTokenStatus } from 'App/Constants/Status'
import { Hash } from 'App/Security/Hash'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'

export default class RefreshTokenSeeder extends BaseSeeder {
  public async run() {
    const users = await User.all()

    for (let i = 0; i < 20; i++) {
      const user = users[i % users.length]
      const rawToken = `sample_refresh_token_${i + 1}_${uuidv4()}`
      const tokenHash = Hash.hashToken(rawToken)

      const existingCount = await RefreshToken.query().where('user_id', user.id).count('* as total')
      if (Number(existingCount[0].$extras.total) < 1) {
        await RefreshToken.create({
          userId: user.id,
          tokenHash,
          expiresAt: DateTime.now().plus({ days: 7 + i }),
          status: RefreshTokenStatus.ACTIVE,
        })
      }
    }
  }
}
