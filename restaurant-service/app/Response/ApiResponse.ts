import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export interface ApiResponsePayload<T = any> {
  success: boolean
  message: string
  data?: T
  meta?: Record<string, any>
}

export class ApiResponse {
  public static send<T>(
    ctx: HttpContextContract,
    success: boolean,
    message: string = '',
    data: T | null = null,
    meta: Record<string, any> = {},
    statusCode: number = 200
  ) {
    const payload: ApiResponsePayload<T> = {
      success,
      message,
      data: data !== null ? data : undefined,
      meta,
    }
    return ctx.response.status(statusCode).send(payload)
  }

  public static success<T>(
    ctx: HttpContextContract,
    data: T,
    message: string = 'Operation successful',
    meta: Record<string, any> = {},
    statusCode: number = 200
  ) {
    return this.send(ctx, true, message, data, meta, statusCode)
  }

  public static error(
    ctx: HttpContextContract,
    message: string = 'An error occurred',
    statusCode: number = 400,
    data: any = null,
    meta: Record<string, any> = {}
  ) {
    return this.send(ctx, false, message, data, meta, statusCode)
  }
}
