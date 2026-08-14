import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { IdempotencyService } from 'App/Services/IdempotencyService'

export default class IdempotencyMiddleware {
  private idempotencyService = new IdempotencyService()

  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    const key = ctx.request.header('Idempotency-Key') || ctx.request.header('idempotency-key')
    if (!key) {
      return await next()
    }

    const user = (ctx as any).auth?.user
    const userId = user ? user.id : 'anonymous'
    const operation = `${ctx.request.method()}:${ctx.request.url()}`
    const requestPayload = ctx.request.all()

    const check = await this.idempotencyService.checkIdempotency(key, operation, requestPayload)
    if (check.isDuplicate && check.cachedResponse) {
      ctx.response.header('X-Cache-Lookup', 'HIT')
      return ctx.response.status(check.cachedResponse.status || 200).send(check.cachedResponse.body)
    }

    const keyRecord = await this.idempotencyService.saveKey(key, userId, operation, requestPayload)

    await next()

    // Cache the response
    const rawBody = (ctx.response as any).lazyBody
    const responseBody = Array.isArray(rawBody) ? rawBody[0] : rawBody
    const responseStatus = ctx.response.response.statusCode
    if (responseStatus >= 200 && responseStatus < 300 && responseBody) {
      await this.idempotencyService.saveResponse(keyRecord.id, {
        status: responseStatus,
        body: responseBody,
      })
    }
  }
}
