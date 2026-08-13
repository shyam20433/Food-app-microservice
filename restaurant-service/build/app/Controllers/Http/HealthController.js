"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Database_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Database"));
const ApiResponse_1 = global[Symbol.for('ioc.use')]("App/Response/ApiResponse");
class HealthController {
    async check(ctx) {
        let dbStatus = false;
        try {
            await Database_1.default.rawQuery('SELECT 1');
            dbStatus = true;
        }
        catch (e) {
            dbStatus = false;
        }
        const isHealthy = dbStatus;
        const statusCode = isHealthy ? 200 : 503;
        return ApiResponse_1.ApiResponse.send(ctx, isHealthy, isHealthy ? 'Restaurant Microservice is healthy' : 'Restaurant Microservice is degraded', {
            service: 'restaurant-service',
            status: isHealthy ? 'UP' : 'DOWN',
            timestamp: new Date().toISOString(),
            checks: {
                database: dbStatus ? 'UP' : 'DOWN',
            },
        }, {}, statusCode);
    }
    async live(ctx) {
        return ApiResponse_1.ApiResponse.success(ctx, { status: 'UP' }, 'Service container is live');
    }
    async ready(ctx) {
        try {
            await Database_1.default.rawQuery('SELECT 1');
            return ApiResponse_1.ApiResponse.success(ctx, { database: 'CONNECTED' }, 'Database connection is ready');
        }
        catch (error) {
            return ApiResponse_1.ApiResponse.error(ctx, 'Database connection is not ready', 503, {
                database: 'DISCONNECTED',
            });
        }
    }
}
exports.default = HealthController;
//# sourceMappingURL=HealthController.js.map