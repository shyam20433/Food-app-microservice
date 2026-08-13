"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const CustomExceptions_1 = global[Symbol.for('ioc.use')]("App/Exceptions/CustomExceptions");
class JwtService {
    static getSecret() {
        if (process.env.JWT_SECRET) {
            return process.env.JWT_SECRET;
        }
        try {
            const Env = global[Symbol.for('ioc.use')]("Adonis/Core/Env").default;
            return Env.get('JWT_SECRET', 'super_secret_jwt_key_adonis_user_service');
        }
        catch {
            return 'super_secret_jwt_key_adonis_user_service';
        }
    }
    static generateToken(payload) {
        const options = { expiresIn: '15m' };
        return jsonwebtoken_1.default.sign(payload, this.getSecret(), options);
    }
    static verifyAccessToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, this.getSecret());
        }
        catch (error) {
            throw new CustomExceptions_1.UnauthorizedException('Invalid or expired access token');
        }
    }
    generateToken(payload) {
        return JwtService.generateToken(payload);
    }
    verifyAccessToken(token) {
        return JwtService.verifyAccessToken(token);
    }
}
exports.JwtService = JwtService;
exports.default = new JwtService();
//# sourceMappingURL=JwtService.js.map