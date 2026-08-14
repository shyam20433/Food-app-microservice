import crypto from 'crypto'
import { IdempotencyRepository } from 'App/Repositories/IdempotencyRepository'
import { DateTime } from 'luxon'
import IdempotencyKey from 'App/Models/IdempotencyKey'

export class IdempotencyService {
  private repo = new IdempotencyRepository()

  public generateHash(payload: any): string {
    const stringified = typeof payload === 'string' ? payload : JSON.stringify(payload || {})
    return crypto.createHash('sha256').update(stringified).digest('hex')
  }

  public async checkIdempotency(
    key: string,
    operation: string,
    requestPayload: any
  ): Promise<{ isDuplicate: boolean; cachedResponse?: any; record?: IdempotencyKey }> {
    const record = await this.repo.findByKeyAndOperation(key, operation)
    if (!record) {
      return { isDuplicate: false }
    }

    const currentHash = this.generateHash(requestPayload)
    if (record.requestHash !== currentHash) {
      // Different payload with same idempotency key
      return { isDuplicate: false }
    }

    return {
      isDuplicate: true,
      cachedResponse: record.response,
      record,
    }
  }

  public async saveKey(
    key: string,
    userId: string,
    operation: string,
    requestPayload: any,
    ttlMinutes = 60
  ): Promise<IdempotencyKey> {
    const requestHash = this.generateHash(requestPayload)
    const expiresAt = DateTime.now().plus({ minutes: ttlMinutes })

    return await this.repo.saveKey({
      key,
      userId,
      operation,
      requestHash,
      expiresAt,
    })
  }

  public async saveResponse(id: string, response: any): Promise<void> {
    await this.repo.updateResponse(id, response)
  }
}
