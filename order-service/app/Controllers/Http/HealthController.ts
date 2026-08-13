import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import { ApiResponse } from 'App/Response/ApiResponse'

export default class HealthController {
  public async check(ctx: HttpContextContract) {
    return ApiResponse.success(
      ctx,
      {
        service: 'order-service',
        status: 'UP',
        timestamp: new Date().toISOString(),
      },
      'Order Microservice is healthy'
    )
  }

  public async live(ctx: HttpContextContract) {
    return ApiResponse.success(ctx, { status: 'UP' }, 'Order Microservice is live')
  }

  public async ready(ctx: HttpContextContract) {
    try {
      await Database.report()
      return ApiResponse.success(
        ctx,
        {
          service: 'order-service',
          status: 'UP',
          checks: { database: 'UP' },
        },
        'Order Microservice is ready'
      )
    } catch (error: any) {
      return ApiResponse.error(
        ctx,
        `PostgreSQL Database check failed: ${error.message}`,
        503,
        'E_DATABASE_READINESS_FAILED'
      )
    }
  }
}
