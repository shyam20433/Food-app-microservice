import { PaymentGatewayInterface } from 'App/Services/PaymentGateway/PaymentGatewayInterface'
import { MockPaymentGateway } from 'App/Services/PaymentGateway/MockPaymentGateway'

export class PaymentGatewayFactory {
  public static getGateway(_gatewayName?: string): PaymentGatewayInterface {
    return new MockPaymentGateway()
  }
}
