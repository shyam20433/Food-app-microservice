import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export class ApiResponse {
  public static success(
    ctx: HttpContextContract,
    data: any = {},
    message: string = 'Success',
    meta: any = {},
    statusCode: number = 200
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
    message: string = 'Error occurred',
    statusCode: number = 400,
    code: string = 'E_BAD_REQUEST',
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
