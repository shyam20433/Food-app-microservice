import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { AssignmentService } from 'App/Services/AssignmentService'
import { ApiResponse } from 'App/Response/ApiResponse'

export default class AssignmentController {
  private assignmentService = new AssignmentService()

  public async assign(ctx: HttpContextContract) {
    const user = (ctx as any).auth.user
    const deliveryId = ctx.params.id

    const delivery = await this.assignmentService.assignNearestPartner(deliveryId, user.id)
    return ApiResponse.success(ctx, delivery, 'Nearest available partner assigned successfully')
  }
}
