import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger)
  }

  public async handle(error: any, ctx: HttpContextContract) {
    // 1. Custom Domain Exceptions
    if (error.code && error.code.startsWith('E_') && error.code !== 'E_VALIDATION_FAILURE') {
      return ctx.response.status(error.status || 400).send({
        success: false,
        status: 'error',
        code: error.code,
        message: error.message,
        statusCode: error.status || 400,
      })
    }

    // 2. Validation Errors
    if (error.name === 'ValidationException') {
      const formattedErrors = (error.messages?.errors || error.messages || []).map((err: any) => ({
        field: err.field || err.rule,
        rule: err.rule,
        message: err.message,
      }))

      return ctx.response.status(422).send({
        success: false,
        status: 'fail',
        code: 'E_VALIDATION_FAILURE',
        message: 'Validation failed for request input',
        statusCode: 422,
        errors: formattedErrors,
      })
    }

    // 3. Database Errors
    if (
      error.code &&
      ((typeof error.code === 'string' && /^\d+$/.test(error.code)) || error.sqlState)
    ) {
      let code = 'E_DATABASE_ERROR'
      let message = 'A database error occurred'
      let statusCode = 400
      let detail = error.detail || error.message

      switch (error.code) {
        case '23505': // Unique Violation
          code = 'E_DB_UNIQUE_VIOLATION'
          message = 'A record with this unique value already exists'
          statusCode = 409
          break
        case '23503': // Foreign Key Violation
          code = 'E_DB_FOREIGN_KEY_VIOLATION'
          message = 'Referenced record does not exist in the database'
          statusCode = 404
          break
        case '23502': // Not Null Violation
          code = 'E_DB_NOT_NULL_VIOLATION'
          message = `Field '${error.column || 'required field'}' cannot be null`
          statusCode = 400
          break
        case '22P02': // Invalid UUID/Text representation
          code = 'E_DB_INVALID_INPUT'
          message = 'Invalid data type or UUID format supplied'
          statusCode = 400
          break
      }

      Logger.error(`[Database Error] ${error.code} - ${error.message}`)

      return ctx.response.status(statusCode).send({
        success: false,
        status: 'error',
        code: code,
        message: message,
        statusCode: statusCode,
        detail: detail,
        table: error.table,
        constraint: error.constraint,
      })
    }

    // 4. Default Fallback Errors
    Logger.error(error)

    return ctx.response.status(error.status || 500).send({
      success: false,
      status: 'error',
      code: error.code || 'E_INTERNAL_SERVER_ERROR',
      message: error.message || 'An unexpected internal server error occurred',
      statusCode: error.status || 500,
    })
  }
}
