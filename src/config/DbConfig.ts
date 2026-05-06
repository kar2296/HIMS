import type { DatabaseConfig } from './BaseConfig';

export const DbConfig: DatabaseConfig = {
    UserName: process.env.DATABASE_USER_NAME,
    Password: process.env.DATABASE_PASSWORD,
    Database: process.env.DATABASE_NAME,
    Options: {
        host: process.env.DATABASE_HOST_NAME,
        port: Number(process.env.DATABASE_PORT),
        dialect: process.env.DATABASE_DIALECT,
        logging: Boolean(Number(process.env.DATABASE_LOGGING)),
        force: true,
        timezone: process.env.DATABASE_TIME_ZONE,
        benchmark: Boolean(Number(process.env.DATABASE_LOGGING)),
        dialectOptions: { decimalNumbers: true },
        pool: {
            max: 10,
            min: 1,
            idle: 20000,
            acquire: 30000,
        }
    }
};


