import DeliveryPartner from 'App/Models/DeliveryPartner'

export interface PartnerDistanceResult {
  partner: DeliveryPartner
  distanceKm: number
}

export class DistanceService {
  /**
   * Calculates the surface distance in kilometers between two points
   * on Earth specified by latitude/longitude using the Haversine formula.
   */
  public calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371.0 // Earth radius in kilometers

    const dLat = this.toRadians(lat2 - lat1)
    const dLon = this.toRadians(lon2 - lon1)

    const rLat1 = this.toRadians(lat1)
    const rLat2 = this.toRadians(lat2)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(rLat1) * Math.cos(rLat2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    const distance = R * c
    return Math.round(distance * 100) / 100 // Round to 2 decimal places
  }

  /**
   * Sorts a list of available delivery partners by proximity to a target coordinate.
   */
  public findNearestPartners(
    partners: DeliveryPartner[],
    targetLat: number,
    targetLon: number,
    maxRadiusKm = 15.0
  ): PartnerDistanceResult[] {
    const scored = partners.map((partner) => {
      const dist = this.calculateDistance(
        targetLat,
        targetLon,
        Number(partner.latitude),
        Number(partner.longitude)
      )
      return { partner, distanceKm: dist }
    })

    return scored
      .filter((item) => item.distanceKm <= maxRadiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
  }

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180
  }
}
