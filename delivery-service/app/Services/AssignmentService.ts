import Database from '@ioc:Adonis/Lucid/Database'
import { DeliveryPartnerRepository } from 'App/Repositories/DeliveryPartnerRepository'
import { DeliveryRepository } from 'App/Repositories/DeliveryRepository'
import { DeliveryStatusHistoryRepository } from 'App/Repositories/DeliveryStatusHistoryRepository'
import { DistanceService } from 'App/Services/DistanceService'
import { DeliveryStateService } from 'App/Services/DeliveryStateService'
import Delivery from 'App/Models/Delivery'
import { DeliveryStatus } from 'App/Constants/DeliveryStatus'
import { PartnerAvailability } from 'App/Constants/PartnerAvailability'
import {
  DeliveryNotFoundException,
  NoAvailableDeliveryPartnerException,
  DeliveryAlreadyAssignedException,
} from 'App/Exceptions/CustomExceptions'

export class AssignmentService {
  private partnerRepo = new DeliveryPartnerRepository()
  private deliveryRepo = new DeliveryRepository()
  private historyRepo = new DeliveryStatusHistoryRepository()
  private distanceService = new DistanceService()

  public async assignNearestPartner(
    deliveryId: string,
    changedBy: string,
    excludePartnerIds: string[] = []
  ): Promise<Delivery> {
    const delivery = await this.deliveryRepo.findById(deliveryId)
    if (!delivery) throw new DeliveryNotFoundException()

    if (delivery.status === DeliveryStatus.ASSIGNED || delivery.status === DeliveryStatus.ACCEPTED) {
      throw new DeliveryAlreadyAssignedException()
    }

    // Target restaurant coordinates
    const pickupAddr = delivery.pickupAddress || {}
    const restLat = Number(pickupAddr.address?.latitude || pickupAddr.latitude || 11.0168)
    const restLon = Number(pickupAddr.address?.longitude || pickupAddr.longitude || 76.9558)

    // Find available partners
    let availablePartners = await this.partnerRepo.findAvailableNearby()
    if (excludePartnerIds.length > 0) {
      availablePartners = availablePartners.filter((p) => !excludePartnerIds.includes(p.id))
    }

    if (availablePartners.length === 0) {
      throw new NoAvailableDeliveryPartnerException('No available delivery partners online')
    }

    // Sort by Haversine distance
    const ranked = this.distanceService.findNearestPartners(availablePartners, restLat, restLon)
    if (ranked.length === 0) {
      throw new NoAvailableDeliveryPartnerException('No delivery partners available within service radius')
    }

    const selectedPartner = ranked[0].partner

    // Database transaction to assign partner & set partner state to BUSY
    const trx = await Database.transaction()

    try {
      DeliveryStateService.validateTransition(delivery.status, DeliveryStatus.ASSIGNED)

      await this.partnerRepo.updateAvailability(
        selectedPartner.id,
        PartnerAvailability.BUSY,
        undefined,
        { client: trx }
      )

      await this.deliveryRepo.updateStatus(
        delivery.id,
        DeliveryStatus.ASSIGNED,
        selectedPartner.id,
        { client: trx }
      )

      await this.historyRepo.createHistory(
        delivery.id,
        DeliveryStatus.ASSIGNED,
        changedBy,
        { client: trx }
      )

      await trx.commit()

      const updated = await this.deliveryRepo.findById(delivery.id)
      return updated!
    } catch (err) {
      await trx.rollback()
      throw err
    }
  }

  public async handlePartnerRejection(
    deliveryId: string,
    partnerUserId: string
  ): Promise<Delivery> {
    const partner = await this.partnerRepo.findByUserId(partnerUserId)
    if (!partner) throw new Error('Delivery partner profile not found')

    const delivery = await this.deliveryRepo.findById(deliveryId)
    if (!delivery) throw new DeliveryNotFoundException()

    if (delivery.deliveryPartnerId !== partner.id) {
      throw new Error('Delivery is not assigned to this partner')
    }

    const trx = await Database.transaction()

    try {
      DeliveryStateService.validateTransition(delivery.status, DeliveryStatus.REJECTED)

      // Release partner back to AVAILABLE
      await this.partnerRepo.updateAvailability(
        partner.id,
        PartnerAvailability.AVAILABLE,
        undefined,
        { client: trx }
      )

      await this.deliveryRepo.updateStatus(
        delivery.id,
        DeliveryStatus.REJECTED,
        null,
        { client: trx }
      )

      await this.historyRepo.createHistory(
        delivery.id,
        DeliveryStatus.REJECTED,
        partner.userId,
        { client: trx }
      )

      await trx.commit()

      // Automatically attempt re-assignment excluding the rejecting partner
      return await this.assignNearestPartner(delivery.id, partner.userId, [partner.id])
    } catch (err) {
      await trx.rollback()
      throw err
    }
  }
}
