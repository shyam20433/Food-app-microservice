import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { DeliveryPartnerService } from 'App/Services/DeliveryPartnerService'
import { DeliveryService } from 'App/Services/DeliveryService'
import { ApiResponse } from 'App/Response/ApiResponse'
import PaginationValidator from 'App/Validators/PaginationValidator'
import { Status } from 'App/Constants/Status'

export default class AdminDeliveryController {
  private partnerService = new DeliveryPartnerService()
  private deliveryService = new DeliveryService()

  public async getAllPartners(ctx: HttpContextContract) {
    const params = await ctx.request.validate(PaginationValidator)

    const result = await this.partnerService.adminGetAllPartners(params)
    return ApiResponse.success(ctx, result.data, 'All delivery partners retrieved successfully', result.meta)
  }

  public async setPartnerStatus(ctx: HttpContextContract) {
    const partnerId = ctx.params.id
    const status = ctx.request.input('status') as Status

    const partner = await this.partnerService.adminSetPartnerStatus(partnerId, status)
    return ApiResponse.success(ctx, partner, `Partner status set to '${partner.status}'`)
  }

  public async getAllDeliveries(ctx: HttpContextContract) {
    const params = await ctx.request.validate(PaginationValidator)

    const result = await this.deliveryService.adminGetAllDeliveries(params)
    return ApiResponse.success(ctx, result.data, 'All deliveries retrieved successfully', result.meta)
  }
}
