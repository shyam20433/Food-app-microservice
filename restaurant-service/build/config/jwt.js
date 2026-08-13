"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConfig = void 0;
const Env_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Core/Env"));
exports.jwtConfig = {
    secret: Env_1.default.get('JWT_SECRET', 'super_secret_jwt_key_adonis_user_service'),
};
exports.default = exports.jwtConfig;
//# sourceMappingURL=jwt.js.map