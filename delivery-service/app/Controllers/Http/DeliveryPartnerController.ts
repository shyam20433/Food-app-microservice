import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { DeliveryPartnerService } from 'App/Services/DeliveryPartnerService'
import { DeliveryService } from 'App/Services/DeliveryService'
import { ApiResponse } from 'App/Response/ApiResponse'
import CreateDeliveryPartnerValidator from 'App/Validators/CreateDeliveryPartnerValidator'
import UpdateDeliveryPartnerValidator from 'App/Validators/UpdateDeliveryPartnerValidator'
import AvailabilityValidator from 'App/Validators/AvailabilityValidator'
import PaginationValidator from 'App/Validators/PaginationValidator'

export default class DeliveryPartnerController {
  private partnerService = new DeliveryPartnerService()
  private deliveryService = new DeliveryService()

  public async register(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const payload = await ctx.request.validate(CreateDeliveryPartnerValidator)
    const token = ctx.request.header('authorization')

    const partner = await this.partnerService.registerPartner(
      user.id,
      user.roles,
      payload,
      token
    )
    return ApiResponse.success(ctx, partner, 'Delivery partner registered successfully', {}, 201)
  }

  public async getMe(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user

    const partner = await this.partnerService.getPartnerByUserId(user.id)
    return ApiResponse.success(ctx, partner, 'Delivery partner profile retrieved successfully')
  }

  public async updateMe(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const payload = await ctx.request.validate(UpdateDeliveryPartnerValidator)

    const partner = await this.partnerService.updatePartnerProfile(user.id, payload)
    return ApiResponse.success(ctx, partner, 'Delivery partner profile updated successfully')
  }

  public async updateAvailability(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const payload = await ctx.request.validate(AvailabilityValidator)

    const partner = await this.partnerService.updateAvailability(
      user.id,
      payload.availability_status,
      { latitude: payload.latitude, longitude: payload.longitude }
    )
    return ApiResponse.success(ctx, partner, `Availability updated to '${partner.availabilityStatus}'`)
  }

  public async getActiveDelivery(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user

    const delivery = await this.deliveryService.getPartnerActiveDelivery(user.id)
    return ApiResponse.success(ctx, delivery, 'Active delivery retrieved successfully')
  }

  public async getPartnerDeliveries(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const params = await ctx.request.validate(PaginationValidator)

    const result = await this.deliveryService.getPartnerDeliveries(user.id, params)
    return ApiResponse.success(ctx, result.data, 'Partner delivery history retrieved successfully', result.meta)
  }
}
