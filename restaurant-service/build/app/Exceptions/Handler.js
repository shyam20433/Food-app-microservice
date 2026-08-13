"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Core/Logger"));
const HttpExceptionHandler_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Core/HttpExceptionHandler"));
class ExceptionHandler extends HttpExceptionHandler_1.default {
    constructor() {
        super(Logger_1.default);
    }
    async handle(error, ctx) {
        if (error.code && error.code.startsWith('E_') && error.code !== 'E_VALIDATION_FAILURE') {
            return ctx.response.status(error.status || 400).send({
                success: false,
                status: 'error',
                code: error.code,
                message: error.message,
                statusCode: error.status || 400,
            });
        }
        if (error.name === 'ValidationException') {
            const formattedErrors = (error.messages?.errors || error.messages || []).map((err) => ({
                field: err.field || err.rule,
                rule: err.rule,
                message: err.message,
            }));
            return ctx.response.status(422).send({
                success: false,
                status: 'fail',
                code: 'E_VALIDATION_FAILURE',
                message: 'Validation failed for request input',
                statusCode: 422,
                errors: formattedErrors,
            });
        }
        if (error.code &&
            ((typeof error.code === 'string' && /^\d+$/.test(error.code)) || error.sqlState)) {
            let code = 'E_DATABASE_ERROR';
            let message = 'A database error occurred';
            let statusCode = 400;
            let detail = error.detail || error.message;
            switch (error.code) {
                case '23505':
                    code = 'E_DB_UNIQUE_VIOLATION';
                    message = 'A record with this unique value already exists';
                    statusCode = 409;
                    break;
                case '23503':
                    code = 'E_DB_FOREIGN_KEY_VIOLATION';
                    message = 'Referenced record does not exist in the database';
                    statusCode = 404;
                    break;
                case '23502':
                    code = 'E_DB_NOT_NULL_VIOLATION';
                    message = `Field '${error.column || 'required field'}' cannot be null`;
                    statusCode = 400;
                    break;
                case '22P02':
                    code = 'E_DB_INVALID_INPUT';
                    message = 'Invalid data type or UUID format supplied';
                    statusCode = 400;
                    break;
            }
            Logger_1.default.error(`[Database Error] ${error.code} - ${error.message}`);
            return ctx.response.status(statusCode).send({
                success: false,
                status: 'error',
                code: code,
                message: message,
                statusCode: statusCode,
                detail: detail,
                table: error.table,
                constraint: error.constraint,
            });
        }
        Logger_1.default.error(error);
        return ctx.response.status(error.status || 500).send({
            success: false,
            status: 'error',
            code: error.code || 'E_INTERNAL_SERVER_ERROR',
            message: error.message || 'An unexpected internal server error occurred',
            statusCode: error.status || 500,
        });
    }
}
exports.default = ExceptionHandler;
//# sourceMappingURL=Handler.js.map