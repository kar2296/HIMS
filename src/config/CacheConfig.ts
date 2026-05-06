import type { IRedisConfig, ICachingPolicyDict, ICachingPolicy } from './BaseConfig';

export const CacheConfig: IRedisConfig = {
    host: process.env.REDIS_HOST_NAME,
    name: 'Cache',
    port: Number(process.env.REDIS_PORT),
    db: '1'
};

export const CachePolicy: ICachingPolicyDict = {
    Default: {
        Expire: 0
    },
    ShortTime: {
        Expire: 60
    },
    Average: {
        Expire: 60 * 60
    },
    LongTime: {
        Expire: 60 * 60 * 24
    }
};
