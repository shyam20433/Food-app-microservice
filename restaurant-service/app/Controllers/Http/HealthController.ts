import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import { ApiResponse } from 'App/Response/ApiResponse'

export default class HealthController {
  public async check(ctx: HttpContextContract) {
    let dbStatus = false
    try {
      await Database.rawQuery('SELECT 1')
      dbStatus = true
    } catch (e) {
      dbStatus = false
    }

    const isHealthy = dbStatus
    const statusCode = isHealthy ? 200 : 503

    return ApiResponse.send(
      ctx,
      isHealthy,
      isHealthy ? 'Restaurant Microservice is healthy' : 'Restaurant Microservice is degraded',
      {
        service: 'restaurant-service',
        status: isHealthy ? 'UP' : 'DOWN',
        timestamp: new Date().toISOString(),
        checks: {
          database: dbStatus ? 'UP' : 'DOWN',
        },
      },
      {},
      statusCode
    )
  }

  public async live(ctx: HttpContextContract) {
    return ApiResponse.success(ctx, { status: 'UP' }, 'Service container is live')
  }

  public async ready(ctx: HttpContextContract) {
    try {
      await Database.rawQuery('SELECT 1')
      return ApiResponse.success(ctx, { database: 'CONNECTED' }, 'Database connection is ready')
    } catch (error) {
      return ApiResponse.error(ctx, 'Database connection is not ready', 503, {
        database: 'DISCONNECTED',
      })
    }
  }
}
