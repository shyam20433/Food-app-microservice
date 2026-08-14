import IdempotencyKey from 'App/Models/IdempotencyKey'
import { DateTime } from 'luxon'

export class IdempotencyRepository {
  public async findByKeyAndOperation(
    key: string,
    operation: string,
    options?: any
  ): Promise<IdempotencyKey | null> {
    const record = await IdempotencyKey.query(options)
      .where('key', key)
      .where('operation', operation)
      .first()

    if (record && record.expiresAt < DateTime.now()) {
      return null
    }
    return record
  }

  public async saveKey(
    data: Partial<IdempotencyKey>,
    options?: any
  ): Promise<IdempotencyKey> {
    const keyRecord = new IdempotencyKey()
    keyRecord.fill(data)
    if (options?.client) {
      keyRecord.useTransaction(options.client)
    }
    await keyRecord.save()
    return keyRecord
  }

  public async updateResponse(
    id: string,
    response: any,
    options?: any
  ): Promise<IdempotencyKey> {
    const keyRecord = await IdempotencyKey.find(id, options)
    if (!keyRecord) throw new Error('Idempotency key not found')
    keyRecord.response = response
    if (options?.client) {
      keyRecord.useTransaction(options.client)
    }
    await keyRecord.save()
    return keyRecord
  }
}
