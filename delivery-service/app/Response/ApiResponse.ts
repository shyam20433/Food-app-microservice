import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export class ApiResponse {
  public static success(
    ctx: HttpContextContract,
    data: any = {},
    message = 'Operation successful',
    meta: any = null,
    statusCode = 200
  ) {
    const responseBody: any = {
      success: true,
      message,
      data,
    }

    if (meta && Object.keys(meta).length > 0) {
      responseBody.meta = meta
    }

    return ctx.response.status(statusCode).send(responseBody)
  }

  public static error(
    ctx: HttpContextContract,
    message = 'An error occurred',
    code = 'E_INTERNAL_SERVER_ERROR',
    statusCode = 500,
    errors: any = null
  ) {
    const responseBody: any = {
      success: false,
      message,
      error: {
        code,
        message,
      },
    }

    if (errors) {
      responseBody.error.details = errors
    }

    return ctx.response.status(statusCode).send(responseBody)
  }
}
