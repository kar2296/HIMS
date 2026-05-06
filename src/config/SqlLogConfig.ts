import type {SqlLoggingConfig} from './BaseConfig';

export const SqlErrorLog: SqlLoggingConfig = {
    file: {
        level: 'error',
        filename: 'SqlError.log',
        handleExceptions: true,
        json: true,
        maxsize: 5242880,
        maxFiles: 100,
        colorize: false
    },
    console: {
        level: 'error',
        handleExceptions: true,
        json: false,
        colorize: true
    },
    directory: __dirname
};
