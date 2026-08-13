"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Env_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Core/Env"));
const databaseConfig = {
    connection: Env_1.default.get('DB_CONNECTION', 'pg'),
    connections: {
        pg: {
            client: 'pg',
            connection: {
                host: Env_1.default.get('PG_HOST', '127.0.0.1'),
                port: Env_1.default.get('PG_PORT', 5432),
                user: Env_1.default.get('PG_USER', 'postgres'),
                password: Env_1.default.get('PG_PASSWORD', '1234'),
                database: Env_1.default.get('PG_DB_NAME', 'restaurant_db'),
            },
            migrations: {
                naturalSort: true,
                paths: ['./database/migrations'],
            },
            healthCheck: true,
            debug: Env_1.default.get('NODE_ENV') === 'development',
        },
    },
};
exports.default = databaseConfig;
//# sourceMappingURL=database.js.map