import Logger from '@ioc:Adonis/Core/Logger'

export type AuditEventType =
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'PASSWORD_CHANGE'
  | 'ROLE_ASSIGNED'
  | 'ROLE_REMOVED'
  | 'USER_REGISTERED'
  | 'USER_REGISTERED_FULL'
  | 'PROFILE_UPDATED'

export interface AuditLogData {
  userId?: string
  targetUserId?: string
  roleName?: string
  ipAddress?: string
  userAgent?: string
  details?: any
}

export class AuditLogService {
  public static log(event: AuditEventType, data: AuditLogData) {
    const timestamp = new Date().toISOString()
    const logPayload = {
      audit: true,
      event,
      timestamp,
      ...data,
    }

    Logger.info(
      `[AUDIT LOG] ${event} - User: ${data.userId || 'GUEST'} | Target: ${
        data.targetUserId || 'N/A'
      }`,
      logPayload
    )
  }
}
