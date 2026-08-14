import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export class ApiResponse {
  public static success(
    ctx: HttpContextContract,
    data: any = null,
    message = 'Success',
    meta: any = {},
    statusCode = 200
  ) {
    return ctx.response.status(statusCode).send({
      success: true,
      message,
      data,
      meta,
    })
  }

  public static error(
    ctx: HttpContextContract,
    message = 'Error',
    statusCode = 400,
    code?: string,
    errors: any[] = []
  ) {
    return ctx.response.status(statusCode).send({
      success: false,
      message,
      code,
      errors,
    })
  }
}
