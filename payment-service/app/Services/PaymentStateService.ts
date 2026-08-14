import { PaymentStatus } from 'App/Constants/PaymentStatus'
import { PaymentInvalidStatusTransitionException } from 'App/Exceptions/CustomExceptions'

export class PaymentStateService {
  private static allowedTransitions: Record<PaymentStatus, PaymentStatus[]> = {
    [PaymentStatus.CREATED]: [PaymentStatus.PENDING, PaymentStatus.CANCELLED, PaymentStatus.FAILED],
    [PaymentStatus.PENDING]: [
      PaymentStatus.PROCESSING,
      PaymentStatus.SUCCESS,
      PaymentStatus.FAILED,
      PaymentStatus.CANCELLED,
    ],
    [PaymentStatus.PROCESSING]: [
      PaymentStatus.SUCCESS,
      PaymentStatus.FAILED,
      PaymentStatus.CANCELLED,
    ],
    [PaymentStatus.SUCCESS]: [PaymentStatus.REFUNDED, PaymentStatus.PARTIALLY_REFUNDED],
    [PaymentStatus.FAILED]: [],
    [PaymentStatus.CANCELLED]: [],
    [PaymentStatus.REFUNDED]: [],
    [PaymentStatus.PARTIALLY_REFUNDED]: [PaymentStatus.REFUNDED],
  }

  public static validateTransition(currentStatus: PaymentStatus, targetStatus: PaymentStatus): boolean {
    if (currentStatus === targetStatus) return true

    const allowed = this.allowedTransitions[currentStatus] || []
    if (!allowed.includes(targetStatus)) {
      throw new PaymentInvalidStatusTransitionException(
        `Cannot transition payment status from '${currentStatus}' to '${targetStatus}'`
      )
    }

    return true
  }
}
