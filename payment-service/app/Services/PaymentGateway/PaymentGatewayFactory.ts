import { PaymentGatewayInterface } from 'App/Services/PaymentGateway/PaymentGatewayInterface'
import { MockPaymentGateway }      from 'App/Services/PaymentGateway/MockPaymentGateway'
import { RazorpayGateway }         from 'App/Services/PaymentGateway/RazorpayGateway'

export class PaymentGatewayFactory {
  public static getGateway(gatewayName?: string): PaymentGatewayInterface {
    switch ((gatewayName || '').toUpperCase()) {
      case 'RAZORPAY':
        return new RazorpayGateway()
      case 'MOCK':
      default:
        return new MockPaymentGateway()
    }
  }
}
