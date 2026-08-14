import User from 'App/Models/User'
import { UserStatus } from 'App/Constants/Status'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import { UserNotFoundException } from 'App/Exceptions/CustomExceptions'

export class UserRepository {
  public async findById(id: string): Promise<User | null> {
    return await User.query()
      .where('id', id)
      .andWhere('status', '!=', UserStatus.DELETED)
      .preload('roles')
      .preload('addresses')
      .first()
  }

  public async findByEmail(email: string): Promise<User | null> {
    return await User.query()
      .where('email', email)
      .andWhere('status', '!=', UserStatus.DELETED)
      .preload('roles')
      .first()
  }

  public async findAll(options?: { includes?: string; status?: UserStatus }): Promise<User[]> {
    const query = User.query().preload('roles').preload('addresses')

    if (options?.includes?.toLowerCase() === 'all') {
      return await query
    }

    if (options?.status) {
      return await query.where('status', options.status)
    }

    return await query.where('status', '!=', UserStatus.DELETED)
  }

  public async insert(
    data: Partial<User>,
    options?: { client?: TransactionClientContract }
  ): Promise<User> {
    const user = new User()
    user.fill(data)
    if (options?.client) {
      user.useTransaction(options.client)
    }
    await user.save()
    return user
  }

  public async update(id: string, data: Partial<User>): Promise<User> {
    const user = await User.query()
      .where('id', id)
      .andWhere('status', '!=', UserStatus.DELETED)
      .first()
    if (!user) {
      throw new UserNotFoundException()
    }
    user.merge(data)
    await user.save()
    await user.load('roles')
    return user
  }

  public async changePassword(id: string, newPassword: string): Promise<User> {
    const user = await User.query()
      .where('id', id)
      .andWhere('status', '!=', UserStatus.DELETED)
      .first()
    if (!user) {
      throw new UserNotFoundException()
    }
    user.password = newPassword
    await user.save()
    return user
  }

  public async setStatus(id: string, status: UserStatus): Promise<User> {
    const user = await User.find(id)
    if (!user) {
      throw new UserNotFoundException()
    }
    user.status = status
    await user.save()
    return user
  }
}
