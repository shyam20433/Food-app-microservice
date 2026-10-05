import { DeliveryStatus } from 'App/Constants/DeliveryStatus'
import { DeliveryInvalidStatusTransitionException } from 'App/Exceptions/CustomExceptions'

export class DeliveryStateService {
  private static allowedTransitions: Record<DeliveryStatus, DeliveryStatus[]> = {
    [DeliveryStatus.ASSIGNING]: [DeliveryStatus.ASSIGNED, DeliveryStatus.CANCELLED],
    [DeliveryStatus.ASSIGNED]: [DeliveryStatus.ACCEPTED, DeliveryStatus.REJECTED, DeliveryStatus.CANCELLED, DeliveryStatus.DELIVERED],
    [DeliveryStatus.ACCEPTED]: [DeliveryStatus.PICKED_UP, DeliveryStatus.CANCELLED],
    [DeliveryStatus.REJECTED]: [DeliveryStatus.ASSIGNING, DeliveryStatus.ASSIGNED],
    [DeliveryStatus.PICKED_UP]: [DeliveryStatus.OUT_FOR_DELIVERY],
    [DeliveryStatus.OUT_FOR_DELIVERY]: [DeliveryStatus.DELIVERED],
    [DeliveryStatus.DELIVERED]: [],
    [DeliveryStatus.CANCELLED]: [],
  }

  public static validateTransition(currentStatus: DeliveryStatus, targetStatus: DeliveryStatus): boolean {
    // Terminal states can never transition — not even to themselves
    const terminalStates = [DeliveryStatus.DELIVERED, DeliveryStatus.CANCELLED]
    if (terminalStates.includes(currentStatus)) {
      throw new DeliveryInvalidStatusTransitionException(
        `Delivery is already in a final state '${currentStatus}' and cannot be updated`
      )
    }

    // Reject same-status re-updates (idempotency must be handled explicitly, not silently)
    if (currentStatus === targetStatus) {
      throw new DeliveryInvalidStatusTransitionException(
        `Delivery status is already '${currentStatus}'`
      )
    }

    const allowed = this.allowedTransitions[currentStatus] || []
    if (!allowed.includes(targetStatus)) {
      throw new DeliveryInvalidStatusTransitionException(
        `Cannot transition delivery status from '${currentStatus}' to '${targetStatus}'`
      )
    }

    return true
  }
}
