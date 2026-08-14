import { DeliveryPartnerRepository } from 'App/Repositories/DeliveryPartnerRepository'
import { UserClient } from 'App/Services/UserClient'
import DeliveryPartner from 'App/Models/DeliveryPartner'
import { PartnerAvailability } from 'App/Constants/PartnerAvailability'
import { VehicleType } from 'App/Constants/VehicleType'
import { Status } from 'App/Constants/Status'
import { Roles } from 'App/Constants/Roles'
import {
  DeliveryPartnerNotFoundException,
  DeliveryPartnerAlreadyExistsException,
} from 'App/Exceptions/CustomExceptions'

export class DeliveryPartnerService {
  private partnerRepo = new DeliveryPartnerRepository()
  private userClient = new UserClient()

  public async registerPartner(
    userId: string,
    roles: string[],
    data: { vehicle_type: VehicleType; vehicle_number: string; latitude?: number; longitude?: number },
    token?: string
  ): Promise<DeliveryPartner> {
    // Verify user role
    const hasRole = roles.includes(Roles.DELIVERY_PARTNER) || roles.includes(Roles.ADMIN)
    if (!hasRole) {
      await this.userClient.verifyDeliveryPartnerRole(userId, token)
    }

    // Verify user not already registered
    const existing = await this.partnerRepo.findByUserId(userId)
    if (existing && existing.status !== Status.DELETED) {
      throw new DeliveryPartnerAlreadyExistsException()
    }

    const partner = await this.partnerRepo.create({
      userId,
      vehicleType: data.vehicle_type,
      vehicleNumber: data.vehicle_number,
      latitude: data.latitude || 11.0168,
      longitude: data.longitude || 76.9558,
      availabilityStatus: PartnerAvailability.OFFLINE,
      status: Status.ENABLED,
    })

    return partner
  }

  public async getPartnerByUserId(userId: string): Promise<DeliveryPartner> {
    const partner = await this.partnerRepo.findByUserId(userId)
    if (!partner || partner.status === Status.DELETED) {
      throw new DeliveryPartnerNotFoundException()
    }
    return partner
  }

  public async updatePartnerProfile(
    userId: string,
    data: { vehicle_type?: VehicleType; vehicle_number?: string; latitude?: number; longitude?: number }
  ): Promise<DeliveryPartner> {
    const partner = await this.getPartnerByUserId(userId)

    if (data.vehicle_type) partner.vehicleType = data.vehicle_type
    if (data.vehicle_number) partner.vehicleNumber = data.vehicle_number
    if (data.latitude !== undefined) partner.latitude = data.latitude
    if (data.longitude !== undefined) partner.longitude = data.longitude

    await partner.save()
    return partner
  }

  public async updateAvailability(
    userId: string,
    availabilityStatus: PartnerAvailability,
    location?: { latitude?: number; longitude?: number }
  ): Promise<DeliveryPartner> {
    const partner = await this.getPartnerByUserId(userId)

    return await this.partnerRepo.updateAvailability(
      partner.id,
      availabilityStatus,
      location
    )
  }

  public async adminGetAllPartners(options?: { page?: number; limit?: number }) {
    return await this.partnerRepo.findAll(options)
  }

  public async adminSetPartnerStatus(
    partnerId: string,
    status: Status
  ): Promise<DeliveryPartner> {
    const partner = await this.partnerRepo.findById(partnerId)
    if (!partner) throw new DeliveryPartnerNotFoundException()

    return await this.partnerRepo.setStatus(partner.id, status)
  }
}
