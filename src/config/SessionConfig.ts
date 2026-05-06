import type { SessionOptions } from './BaseConfig';
import { AppConfig } from './AppConfig';

export const SessionConfig: SessionOptions = {
    secret: process.env.SESSION_SECRET,
    cookie: { secure: AppConfig.IsHttpsEnabled, maxAge: Number(process.env.SESSION_MAX_AGE), httpOnly: false },
    resave: false,
    saveUninitialized: false,
    rolling: true,
};
