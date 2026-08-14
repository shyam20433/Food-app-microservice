import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'

export default class HealthController {
  public async check({ response }: HttpContextContract) {
    return response.status(200).send({
      status: 'healthy',
      service: 'payment-service',
      timestamp: new Date().toISOString(),
    })
  }

  public async live({ response }: HttpContextContract) {
    return response.status(200).send({
      status: 'live',
      service: 'payment-service',
    })
  }

  public async ready({ response }: HttpContextContract) {
    try {
      await Database.rawQuery('SELECT 1')
      return response.status(200).send({
        status: 'ready',
        service: 'payment-service',
        database: 'connected',
      })
    } catch (error: any) {
      return response.status(503).send({
        status: 'unready',
        service: 'payment-service',
        database: 'disconnected',
        error: error.message,
      })
    }
  }
}
