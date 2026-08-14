import { PaymentGatewayInterface } from 'App/Services/PaymentGateway/PaymentGatewayInterface'
import { MockPaymentGateway } from 'App/Services/PaymentGateway/MockPaymentGateway'
import { RazorpayGateway } from 'App/Services/PaymentGateway/RazorpayGateway'
import { PaymentGateway } from 'App/Constants/PaymentGateway'
import Env from '@ioc:Adonis/Core/Env'

export class PaymentGatewayFactory {
  public static getGateway(gatewayName?: string): PaymentGatewayInterface {
    const selected = (gatewayName || Env.get('DEFAULT_PAYMENT_GATEWAY', 'MOCK')).toUpperCase()

    switch (selected) {
      case PaymentGateway.RAZORPAY:
        return new RazorpayGateway()
      case PaymentGateway.MOCK:
      default:
        return new MockPaymentGateway()
    }
  }
}
