import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ApiResponse } from 'App/Response/ApiResponse'
import { CustomException } from 'App/Exceptions/CustomExceptions'

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger)
  }

  public async handle(error: any, ctx: HttpContextContract) {
    if (error instanceof CustomException) {
      return ApiResponse.error(ctx, error.message, error.code, error.status)
    }

    if (error.name === 'ValidationException') {
      return ApiResponse.error(
        ctx,
        'Validation failed',
        'E_VALIDATION_FAILURE',
        422,
        error.messages?.errors || error.messages
      )
    }

    Logger.error(error)
    return ApiResponse.error(
      ctx,
      error.message || 'Internal server error',
      error.code || 'E_INTERNAL_SERVER_ERROR',
      error.status || 500
    )
  }
}
