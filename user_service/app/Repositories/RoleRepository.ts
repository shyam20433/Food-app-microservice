import Role from 'App/Models/Role'

export class RoleRepository {
  public async findAll(): Promise<Role[]> {
    return await Role.all()
  }

  public async findByName(name: string): Promise<Role | null> {
    return await Role.find(name)
  }
}
