"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ApiResponse_1 = global[Symbol.for('ioc.use')]("App/Response/ApiResponse");
class RoleMiddleware {
    async handle(ctx, next, allowedRoles) {
        const user = ctx.auth?.user;
        if (!user) {
            return ApiResponse_1.ApiResponse.error(ctx, 'Unauthorized access', 401);
        }
        const userRoles = user.roles || [];
        const hasPermission = allowedRoles.some((role) => userRoles.includes(role));
        if (!hasPermission) {
            return ApiResponse_1.ApiResponse.error(ctx, `Forbidden: Required role(s) [${allowedRoles.join(', ')}] missing`, 403);
        }
        await next();
    }
}
exports.default = RoleMiddleware;
//# sourceMappingURL=RoleMiddleware.js.map