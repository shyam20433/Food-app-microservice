import DeliveryPartner from 'App/Models/DeliveryPartner'
import { PartnerAvailability } from 'App/Constants/PartnerAvailability'
import { Status } from 'App/Constants/Status'

export class DeliveryPartnerRepository {
  public async create(data: Partial<DeliveryPartner>, options?: any): Promise<DeliveryPartner> {
    const partner = new DeliveryPartner()
    partner.fill(data)
    if (options?.client) {
      partner.useTransaction(options.client)
    }
    await partner.save()
    return partner
  }

  public async findById(id: string, options?: any): Promise<DeliveryPartner | null> {
    return await DeliveryPartner.query(options).where('id', id).first()
  }

  public async findByUserId(userId: string, options?: any): Promise<DeliveryPartner | null> {
    return await DeliveryPartner.query(options).where('user_id', userId).first()
  }

  public async findAvailableNearby(options?: any): Promise<DeliveryPartner[]> {
    return await DeliveryPartner.query(options)
      .where('status', Status.ENABLED)
      .where('availability_status', PartnerAvailability.AVAILABLE)
  }

  public async updateAvailability(
    id: string,
    availabilityStatus: PartnerAvailability,
    location?: { latitude?: number; longitude?: number },
    options?: any
  ): Promise<DeliveryPartner> {
    const partner = await DeliveryPartner.find(id, options)
    if (!partner) throw new Error('Delivery partner not found')

    partner.availabilityStatus = availabilityStatus
    if (location?.latitude !== undefined) partner.latitude = location.latitude
    if (location?.longitude !== undefined) partner.longitude = location.longitude

    if (options?.client) {
      partner.useTransaction(options.client)
    }
    await partner.save()
    return partner
  }

  public async setStatus(id: string, status: Status, options?: any): Promise<DeliveryPartner> {
    const partner = await DeliveryPartner.find(id, options)
    if (!partner) throw new Error('Delivery partner not found')

    partner.status = status
    if (options?.client) {
      partner.useTransaction(options.client)
    }
    await partner.save()
    return partner
  }

  public async findAll(options?: { page?: number; limit?: number }): Promise<{ data: DeliveryPartner[]; meta: any }> {
    const page = options?.page || 1
    const limit = options?.limit || 20

    const query = DeliveryPartner.query().whereNot('status', Status.DELETED).orderBy('created_at', 'desc')
    const paginated = await query.paginate(page, limit)
    const json = paginated.toJSON()
    return { data: json.data as DeliveryPartner[], meta: json.meta }
  }
}
