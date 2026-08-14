import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'

export default class HealthController {
  public async check({ response }: HttpContextContract) {
    return response.status(200).send({
      status: 'healthy',
      service: 'delivery-service',
      timestamp: new Date().toISOString(),
    })
  }

  public async live({ response }: HttpContextContract) {
    return response.status(200).send({
      status: 'live',
      service: 'delivery-service',
    })
  }

  public async ready({ response }: HttpContextContract) {
    try {
      await Database.rawQuery('SELECT 1')
      return response.status(200).send({
        status: 'ready',
        service: 'delivery-service',
        database: 'connected',
      })
    } catch (error: any) {
      return response.status(503).send({
        status: 'unready',
        service: 'delivery-service',
        database: 'disconnected',
        error: error.message,
      })
    }
  }
}
