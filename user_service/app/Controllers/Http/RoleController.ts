import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { RoleRepository } from 'App/Repositories/RoleRepository'
import { ApiResponse } from 'App/Response/ApiResponse'

export default class RoleController {
  private roleRepo = new RoleRepository()

  public async index(ctx: HttpContextContract) {
    const roles = await this.roleRepo.findAll()
    return ApiResponse.success(ctx, roles, 'Roles fetched successfully')
  }

  public async show(ctx: HttpContextContract) {
    const role = await this.roleRepo.findByName(ctx.params.name || ctx.params.id)
    if (!role) {
      return ApiResponse.error(ctx, 'Role not found', 404)
    }
    return ApiResponse.success(ctx, role, 'Role details fetched successfully')
  }
}
