import Address from 'App/Models/Address'
import { AddressStatus } from 'App/Constants/Status'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import { AddressNotFoundException } from 'App/Exceptions/CustomExceptions'

export class AddressRepository {
  public async findById(id: string): Promise<Address | null> {
    return await Address.query()
      .where('id', id)
      .andWhere('status', '!=', AddressStatus.DELETED)
      .first()
  }

  public async findByUserId(userId: string): Promise<Address[]> {
    return await Address.query()
      .where('user_id', userId)
      .andWhere('status', '!=', AddressStatus.DELETED)
      .orderBy('is_default', 'desc')
  }

  public async insert(
    data: Partial<Address>,
    options?: { client?: TransactionClientContract }
  ): Promise<Address> {
    const address = new Address()
    address.fill(data)
    if (options?.client) {
      address.useTransaction(options.client)
    }
    await address.save()
    return address
  }

  public async update(id: string, data: Partial<Address>): Promise<Address> {
    const address = await Address.query()
      .where('id', id)
      .andWhere('status', '!=', AddressStatus.DELETED)
      .first()
    if (!address) {
      throw new AddressNotFoundException()
    }
    if (data.isDefault) {
      await Address.query()
        .where('user_id', address.userId)
        .andWhere('status', '!=', AddressStatus.DELETED)
        .update({ is_default: false })
    }
    address.merge(data)
    await address.save()
    return address
  }

  public async setDefault(id: string, userId: string): Promise<Address> {
    const address = await Address.query()
      .where('id', id)
      .andWhere('user_id', userId)
      .andWhere('status', '!=', AddressStatus.DELETED)
      .first()

    if (!address) {
      throw new AddressNotFoundException()
    }

    await Address.query()
      .where('user_id', userId)
      .andWhere('status', '!=', AddressStatus.DELETED)
      .update({ is_default: false })

    address.isDefault = true
    await address.save()
    return address
  }

  public async setStatus(id: string, status: AddressStatus): Promise<Address> {
    const address = await Address.find(id)
    if (!address) {
      throw new AddressNotFoundException()
    }
    address.status = status
    await address.save()
    return address
  }
}
