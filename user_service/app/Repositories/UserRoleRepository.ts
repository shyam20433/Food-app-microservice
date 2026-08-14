import UserRole from 'App/Models/UserRole'
import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'

export class UserRoleRepository {
  public async assignRole(
    userId: string,
    roleName: string,
    options?: { client?: TransactionClientContract }
  ): Promise<UserRole> {
    const query = UserRole.query().where('user_id', userId).andWhere('role_name', roleName)
    if (options?.client) {
      query.useTransaction(options.client)
    }
    const existing = await query.first()

    if (existing) {
      return existing
    }

    const userRole = new UserRole()
    userRole.fill({ userId, roleName })
    if (options?.client) {
      userRole.useTransaction(options.client)
    }
    await userRole.save()
    return userRole
  }

  public async removeRole(userId: string, roleName: string): Promise<void> {
    await UserRole.query().where('user_id', userId).andWhere('role_name', roleName).delete()
  }

  public async getUserRoles(userId: string): Promise<UserRole[]> {
    return await UserRole.query().where('user_id', userId)
  }
}
