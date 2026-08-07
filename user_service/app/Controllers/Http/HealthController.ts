import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import { ApiResponse } from 'App/Response/ApiResponse'

export default class HealthController {
  public async check(ctx: HttpContextContract) {
    let dbStatus = 'DOWN'

    try {
      await Database.rawQuery('SELECT 1')
      dbStatus = 'UP'
    } catch (error) {
      dbStatus = 'DOWN'
    }

    const isHealthy = dbStatus === 'UP'
    const statusCode = isHealthy ? 200 : 503

    return ApiResponse.send(
      ctx,
      isHealthy,
      isHealthy ? 'Microservice is healthy' : 'Microservice health check failed',
      {
        status: isHealthy ? 'UP' : 'DOWN',
        database: dbStatus,
      },
      {},
      statusCode
    )
  }

  public async live(ctx: HttpContextContract) {
    return ApiResponse.success(ctx, { status: 'UP' }, 'Microservice is live')
  }

  public async ready(ctx: HttpContextContract) {
    try {
      await Database.rawQuery('SELECT 1')
      return ApiResponse.success(
        ctx,
        { status: 'UP', database: 'UP' },
        'Microservice is ready to accept traffic'
      )
    } catch (error) {
      return ApiResponse.error(ctx, 'Microservice database readiness check failed', 503, {
        status: 'DOWN',
        database: 'DOWN',
      })
    }
  }
}
