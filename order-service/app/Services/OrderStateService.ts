import { OrderStatus } from '../Constants/OrderStatus'
import { OrderInvalidStatusTransitionException } from '../Exceptions/CustomExceptions'

export class OrderStateService {
  private static allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.REJECTED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
    [OrderStatus.PREPARING]: [OrderStatus.READY],
    [OrderStatus.READY]: [OrderStatus.OUT_FOR_DELIVERY],
    [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.REJECTED]: [],
    [OrderStatus.CANCELLED]: [],
  }

  public static validateTransition(currentStatus: OrderStatus, targetStatus: OrderStatus): void {
    const validNextStates = this.allowedTransitions[currentStatus] || []
    if (!validNextStates.includes(targetStatus)) {
      throw new OrderInvalidStatusTransitionException(
        `Cannot transition order status from ${currentStatus} to ${targetStatus}`
      )
    }
  }

  public static isTransitionAllowed(currentStatus: OrderStatus, targetStatus: OrderStatus): boolean {
    const validNextStates = this.allowedTransitions[currentStatus] || []
    return validNextStates.includes(targetStatus)
  }
}
