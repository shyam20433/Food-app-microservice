import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger)
  }

  public async handle(error: any, ctx: HttpContextContract) {
    if (error.code === 'E_VALIDATION_FAILURE') {
      return ctx.response.status(422).send({
        success: false,
        message: 'Validation failed for request input',
        code: error.code,
        errors: error.messages?.errors || error.messages || [],
      })
    }

    const status = error.status || 500
    const code = error.code || 'E_INTERNAL_SERVER_ERROR'
    const message = error.message || 'Internal Server Error'

    return ctx.response.status(status).send({
      success: false,
      message,
      code,
    })
  }
}
