import Database from '@ioc:Adonis/Lucid/Database'
import { DeliveryRepository } from 'App/Repositories/DeliveryRepository'
import { DeliveryPartnerRepository } from 'App/Repositories/DeliveryPartnerRepository'
import { DeliveryStatusHistoryRepository } from 'App/Repositories/DeliveryStatusHistoryRepository'
import { OrderClient } from 'App/Services/OrderClient'
import { RestaurantClient } from 'App/Services/RestaurantClient'
import { AssignmentService } from 'App/Services/AssignmentService'
import { DeliveryStateService } from 'App/Services/DeliveryStateService'
import Delivery from 'App/Models/Delivery'
import { publishEvent } from 'App/Services/RabbitMQService'
import { DeliveryStatus } from 'App/Constants/DeliveryStatus'
import { PartnerAvailability } from 'App/Constants/PartnerAvailability'
import { Roles } from 'App/Constants/Roles'
import {
  DeliveryNotFoundException,
  ActiveDeliveryNotFoundException,
  DeliveryAccessDeniedException,
  DeliveryPartnerNotFoundException,
} from 'App/Exceptions/CustomExceptions'

export class DeliveryService {
  private deliveryRepo = new DeliveryRepository()
  private partnerRepo = new DeliveryPartnerRepository()
  private historyRepo = new DeliveryStatusHistoryRepository()
  private orderClient = new OrderClient()
  private restaurantClient = new RestaurantClient()
  private assignmentService = new AssignmentService()

  public async createDelivery(
    orderId: string,
    changedBy: string,
    token?: string
  ): Promise<Delivery> {
    // 1. Check existing delivery for order
    const existing = await this.deliveryRepo.findByOrderId(orderId)
    if (existing) {
      return existing
    }

    // 2. Fetch authoritative order details
    const order = await this.orderClient.getOrder(orderId, token)
    await this.orderClient.verifyOrderEligibleForDelivery(order)

    // 3. Fetch authoritative restaurant pickup details
    const restaurant = await this.restaurantClient.getRestaurant(order.restaurantId, token)

    // 4. Create delivery inside transaction
    const trx = await Database.transaction()

    try {
      const delivery = await this.deliveryRepo.create(
        {
          orderId: order.id,
          restaurantId: order.restaurantId,
          pickupAddress: restaurant,
          deliveryAddress: order.deliveryAddress,
          status: DeliveryStatus.ASSIGNING,
        },
        { client: trx }
      )

      await this.historyRepo.createHistory(
        delivery.id,
        DeliveryStatus.ASSIGNING,
        changedBy,
        { client: trx }
      )

      await trx.commit()

      // 5. Attempt auto-assignment to nearest partner
      try {
        await this.assignmentService.assignNearestPartner(delivery.id, changedBy)
      } catch {
        // Safe to swallow assignment exception; delivery remains in ASSIGNING status
      }

      const created = await this.deliveryRepo.findById(delivery.id)
      return created!
    } catch (err) {
      await trx.rollback()
      throw err
    }
  }

  public async acceptAssignment(deliveryId: string, partnerUserId: string): Promise<Delivery> {
    const partner = await this.partnerRepo.findByUserId(partnerUserId)
    if (!partner) throw new DeliveryPartnerNotFoundException()

    const delivery = await this.deliveryRepo.findById(deliveryId)
    if (!delivery) throw new DeliveryNotFoundException()

    if (delivery.deliveryPartnerId !== partner.id) {
      throw new DeliveryAccessDeniedException('Delivery is not assigned to this partner')
    }

    DeliveryStateService.validateTransition(delivery.status, DeliveryStatus.ACCEPTED)

    const trx = await Database.transaction()

    try {
      await this.partnerRepo.updateAvailability(
        partner.id,
        PartnerAvailability.BUSY,
        undefined,
        { client: trx }
      )

      await this.deliveryRepo.updateStatus(
        delivery.id,
        DeliveryStatus.ACCEPTED,
        partner.id,
        { client: trx }
      )

      await this.historyRepo.createHistory(
        delivery.id,
        DeliveryStatus.ACCEPTED,
        partner.userId,
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

  public async updateDeliveryStatus(
    deliveryId: string,
    partnerUserId: string,
    targetStatus: DeliveryStatus.PICKED_UP | DeliveryStatus.OUT_FOR_DELIVERY | DeliveryStatus.DELIVERED
  ): Promise<Delivery> {
    const partner = await this.partnerRepo.findByUserId(partnerUserId)
    if (!partner) throw new DeliveryPartnerNotFoundException()

    const delivery = await this.deliveryRepo.findById(deliveryId)
    if (!delivery) throw new DeliveryNotFoundException()

    if (delivery.deliveryPartnerId !== partner.id) {
      throw new DeliveryAccessDeniedException('Delivery is not assigned to this partner')
    }

    DeliveryStateService.validateTransition(delivery.status, targetStatus)

    const trx = await Database.transaction()

    try {
      await this.deliveryRepo.updateStatus(
        delivery.id,
        targetStatus,
        partner.id,
        { client: trx }
      )

      // When delivered, set partner availability back to AVAILABLE
      if (targetStatus === DeliveryStatus.DELIVERED) {
        await this.partnerRepo.updateAvailability(
          partner.id,
          PartnerAvailability.AVAILABLE,
          undefined,
          { client: trx }
        )
      }

      await this.historyRepo.createHistory(
        delivery.id,
        targetStatus,
        partner.userId,
        { client: trx }
      )

      await trx.commit()

      const updated = await this.deliveryRepo.findById(delivery.id)

      publishEvent('delivery.status_updated', {
        delivery_id: updated!.id,
        order_id: updated!.orderId,
        status: targetStatus,
      })

      return updated!
    } catch (err) {
      await trx.rollback()
      throw err
    }
  }

  public async handleOrderConfirmed(event: { order_id: string; user_id?: string; restaurant_id: string; delivery_address: any }) {
    const existing = await this.deliveryRepo.findByOrderId(event.order_id)
    if (existing) return

    try {
      const restaurant = await this.restaurantClient.getRestaurant(event.restaurant_id)
      const changedBy = event.user_id || '00000000-0000-0000-0000-000000000000'

      const trx = await Database.transaction()
      let delivery: Delivery
      try {
        delivery = await this.deliveryRepo.create(
          {
            orderId: event.order_id,
            restaurantId: event.restaurant_id,
            pickupAddress: restaurant,
            deliveryAddress: event.delivery_address,
            status: DeliveryStatus.ASSIGNING,
          },
          { client: trx }
        )

        await this.historyRepo.createHistory(
          delivery.id,
          DeliveryStatus.ASSIGNING,
          changedBy,
          { client: trx }
        )

        await trx.commit()
      } catch (err) {
        await trx.rollback()
        throw err
      }

      try {
        await this.assignmentService.assignNearestPartner(delivery.id, changedBy)
        console.log(`[DeliveryService] Auto-assigned delivery for order ${event.order_id}`)
      } catch {
        console.warn(`[DeliveryService] Created delivery for order ${event.order_id}, waiting for available partner`)
      }
    } catch (err) {
      console.error(`[DeliveryService] Failed handling order.confirmed event for order ${event.order_id}:`, err)
    }
  }

  public async getDeliveryById(
    deliveryId: string,
    userId: string,
    roles: string[],
    token?: string
  ): Promise<any> {
    const delivery = await this.deliveryRepo.findById(deliveryId)
    if (!delivery) throw new DeliveryNotFoundException()

    const isAdmin = roles.includes(Roles.ADMIN) || roles.includes(Roles.SUPER_ADMIN)
    if (!isAdmin) {
      const partner = await this.partnerRepo.findByUserId(userId)
      const isPartnerAssigned = partner && delivery.deliveryPartnerId === partner.id

      if (!isPartnerAssigned) {
        // Check if customer owns the order
        const customerOrderIds = await this.orderClient.getCustomerOrderIds(userId, token)
        if (!customerOrderIds.includes(delivery.orderId)) {
          throw new DeliveryAccessDeniedException()
        }
      }
    }

    // Scrub sensitive partner details
    const partnerInfo = delivery.partner
      ? {
          name: 'Delivery Partner',
          vehicle_type: delivery.partner.vehicleType,
          vehicle_number: delivery.partner.vehicleNumber,
        }
      : null

    return {
      delivery_id: delivery.id,
      order_id: delivery.orderId,
      restaurant_id: delivery.restaurantId,
      status: delivery.status,
      assigned_at: delivery.assignedAt,
      picked_up_at: delivery.pickedUpAt,
      delivered_at: delivery.deliveredAt,
      delivery_partner: partnerInfo,
      delivery_address: delivery.deliveryAddress,
      pickup_address: delivery.pickupAddress,
      history: delivery.history,
    }
  }

  public async getPartnerActiveDelivery(userId: string): Promise<Delivery> {
    const partner = await this.partnerRepo.findByUserId(userId)
    if (!partner) throw new DeliveryPartnerNotFoundException()

    const activeDelivery = await this.deliveryRepo.findActiveByPartner(partner.id)
    if (!activeDelivery) throw new ActiveDeliveryNotFoundException()

    return activeDelivery
  }

  public async getPartnerDeliveries(
    userId: string,
    options?: { page?: number; limit?: number }
  ) {
    const partner = await this.partnerRepo.findByUserId(userId)
    if (!partner) throw new DeliveryPartnerNotFoundException()

    return await this.deliveryRepo.findByPartnerHistory(partner.id, options)
  }

  public async getCustomerDeliveries(
    userId: string,
    options?: { page?: number; limit?: number },
    token?: string
  ) {
    const orderIds = await this.orderClient.getCustomerOrderIds(userId, token)
    if (orderIds.length === 0) {
      return { data: [], meta: { page: 1, limit: 20, total: 0 } }
    }

    return await this.deliveryRepo.findByOrderIds(orderIds, options)
  }

  public async adminGetAllDeliveries(options?: { page?: number; limit?: number }) {
    return await this.deliveryRepo.findAll(options)
  }
}
