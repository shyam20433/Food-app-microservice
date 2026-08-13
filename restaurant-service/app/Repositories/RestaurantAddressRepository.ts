import RestaurantAddress from 'App/Models/RestaurantAddress'
import { AddressStatus } from 'App/Constants/Status'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import { AddressNotFoundException } from 'App/Exceptions/CustomExceptions'

export class RestaurantAddressRepository {
  public async insert(
    data: Partial<RestaurantAddress>,
    options?: { client?: TransactionClientContract }
  ): Promise<RestaurantAddress> {
    const address = new RestaurantAddress()
    address.fill(data)
    if (options?.client) {
      address.useTransaction(options.client)
    }
    await address.save()
    return address
  }

  public async findByRestaurantId(restaurantId: string): Promise<RestaurantAddress | null> {
    return await RestaurantAddress.query()
      .where('restaurant_id', restaurantId)
      .andWhere('status', '!=', AddressStatus.DELETED)
      .first()
  }

  public async update(
    restaurantId: string,
    data: Partial<RestaurantAddress>
  ): Promise<RestaurantAddress> {
    const address = await RestaurantAddress.query()
      .where('restaurant_id', restaurantId)
      .andWhere('status', '!=', AddressStatus.DELETED)
      .first()

    if (!address) {
      throw new AddressNotFoundException()
    }

    address.merge(data)
    await address.save()
    return address
  }

  public async setStatus(restaurantId: string, status: AddressStatus): Promise<RestaurantAddress> {
    const address = await RestaurantAddress.query()
      .where('restaurant_id', restaurantId)
      .first()

    if (!address) {
      throw new AddressNotFoundException()
    }

    address.status = status
    await address.save()
    return address
  }
}
