"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    static send(ctx, success, message = '', data = null, meta = {}, statusCode = 200) {
        const payload = {
            success,
            message,
            data: data !== null ? data : undefined,
            meta,
        };
        return ctx.response.status(statusCode).send(payload);
    }
    static success(ctx, data, message = 'Operation successful', meta = {}, statusCode = 200) {
        return this.send(ctx, true, message, data, meta, statusCode);
    }
    static error(ctx, message = 'An error occurred', statusCode = 400, data = null, meta = {}) {
        return this.send(ctx, false, message, data, meta, statusCode);
    }
}
exports.ApiResponse = ApiResponse;
//# sourceMappingURL=ApiResponse.js.map