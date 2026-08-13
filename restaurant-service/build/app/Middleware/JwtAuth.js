"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const JwtService_1 = __importDefault(global[Symbol.for('ioc.use')]("App/Services/JwtService"));
const CustomExceptions_1 = global[Symbol.for('ioc.use')]("App/Exceptions/CustomExceptions");
class JwtAuth {
    async handle(ctx, next) {
        const authHeader = ctx.request.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new CustomExceptions_1.UnauthorizedException('Authentication token missing or malformed');
        }
        const token = authHeader.substring(7);
        const payload = JwtService_1.default.verifyAccessToken(token);
        const userId = payload.id || payload.userId;
        if (!userId) {
            throw new CustomExceptions_1.UnauthorizedException('Invalid access token payload');
        }
        ctx.auth = {
            user: {
                id: userId,
                email: payload.email,
                roles: payload.roles || [],
            },
        };
        await next();
    }
}
exports.default = JwtAuth;
//# sourceMappingURL=JwtAuth.js.map