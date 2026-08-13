import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ApiResponse } from 'App/Response/ApiResponse'

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger)
  }

  public async handle(error: any, ctx: HttpContextContract) {
    // 1. Handle Validation Exception
    if (error.code === 'E_VALIDATION_FAILURE') {
      const messages = error.messages ? error.messages.errors || error.messages : []
      const firstMessage = messages.length > 0 ? messages[0].message : 'Validation failed'
      return ApiResponse.error(ctx, firstMessage, 422, 'E_VALIDATION_FAILURE', messages)
    }

    // 2. Handle Custom Domain Exceptions with custom status and code
    if (error.status && error.code) {
      return ApiResponse.error(ctx, error.message, error.status, error.code)
    }

    // 3. Handle Route Not Found
    if (error.code === 'E_ROUTE_NOT_FOUND') {
      return ApiResponse.error(ctx, 'Requested endpoint not found', 404, 'E_ROUTE_NOT_FOUND')
    }

    // 4. Default 500 Server Error
    Logger.error(error)
    return ApiResponse.error(
      ctx,
      error.message || 'Internal server error',
      error.status || 500,
      error.code || 'E_INTERNAL_SERVER_ERROR'
    )
  }
}
