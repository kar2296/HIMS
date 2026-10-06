import * as redis from 'redis';
import { CacheConfig } from '../../../config/index';
import { RedisClient, Callback, ClientOpts } from 'redis';

export class Redis {
    private static singleton: Redis;
    private client: RedisClient;
    public static get Instance(): Redis {
        if (!this.singleton) {
            this.singleton = new Redis(CacheConfig);
        }
        return this.singleton;
    }

    public constructor(config: ClientOpts) {
        this.client = redis.createClient(config);
    }

    public Auth(password: string): void {
        //this.client.auth();
        throw 'Not implemented fully.';
    }

    public async Select(dbIndex: number): Promise<string> {
        return new Promise<string>((resolver, reject) => {
            return this.client.select(dbIndex, (err: Error, res: string) => {
                if (err) {
                    reject(err);
                }
                resolver(res);
            });
        });
    }

    public async Set<TValue>(key: string, value: TValue): Promise<boolean> {
        return new Promise<boolean>((resolver, reject) => {
            return this.client.set(key, JSON.stringify(value), (err: Error, res: string) => {
                if (err) {
                    reject(err);
                }
                resolver(res === 'OK');
            });
        });
    }

    public async HSet<TValue>(key: string, value: TValue, regionName: string): Promise<number> {
        return new Promise<number>((resolver, reject) => {
            return this.client.hset(regionName, key, JSON.stringify(value), (err: Error, res: number) => {
                if (err) {
                    reject(err);
                }
                resolver(res);
            });
        });
    }

    public async Get<TValue>(key: string): Promise<TValue> {
        return new Promise<TValue>((resolver, reject) => {
            this.client.get(key, (err: Error, res: string) => {
                if (err) {
                    reject(err);
                }
                return resolver(JSON.parse(res));
            });
        });
    }

    public async TTL(key: string): Promise<number> {
        return new Promise<number>((resolver, reject) => {
            this.client.ttl(key, (err: Error, res: number) => {
                if (err) {
                    reject(err);
                }
                return resolver(res);
            });
        });
    }

    public async HGet<TValue>(key: string, regionName: string): Promise<TValue> {
        return new Promise<TValue>((resolver, reject) => {
            this.client.hget(regionName, key, (err: Error, res: string) => {
                if (err) {
                    reject(err);
                }
                return resolver(JSON.parse(res));
            });
        });
    }

    public async Expire(key: string, expire: number): Promise<number> {
        return new Promise<number>((resolver, reject) => {
            this.client.expire(key, expire, (err: Error, res: number) => {
                if (err) {
                    reject(err);
                }
                return resolver(res);
            });
        });
    }

    public async Del(key: string): Promise<number> {
        return new Promise<number>((resolver, reject) => {
            this.client.del(key, (err: Error, res: number) => {
                if (err) {
                    reject(err);
                }
                return resolver(res);
            });
        });
    }

    public async HDel(key: string, regionName: string): Promise<number> {
        return new Promise<number>((resolver, reject) => {
            this.client.hdel(regionName, key, (err: Error, res: number) => {
                if (err) {
                    reject(err);
                }
                return resolver(res);
            });
        });
    }

    public async Keys(regionName?: string): Promise<Array<string>> {
        return new Promise<Array<string>>((resolver, reject) => {
            let callback: Callback<Array<string>> = (err: Error, res: Array<string>) => {
                if (err) { reject(err); }
                return resolver(res);
            };
            this.client.keys(regionName, callback);
        });
    }

    public async HKeys(regionName: string): Promise<Array<string>> {
        return new Promise<Array<string>>((resolver, reject) => {
            let callback: Callback<Array<string>> = (err: Error, res: Array<string>) => {
                if (err) { reject(err); }
                return resolver(res);
            };
            this.client.hkeys(regionName, callback);
        });
    }

    public async FlushDb(): Promise<string> {
        return new Promise<string>((resolver, reject) => {
            let callback: Callback<string> = (err: Error, res: string) => {
                if (err) { reject(err); }
                return resolver(res);
            };
            this.client.flushdb(callback);
        });
    }
    public async Incr(key: string): Promise<number> {
        return new Promise<number>((resolver, reject) => {
            let callback: Callback<number> = (err: Error, res: number) => {
                if (err) { reject(err); }
                return resolver(res);
            };
            this.client.incr(key, callback);
        });
    }

    public async IncrBy(key: string, by: number): Promise<number> {
        return new Promise<number>((resolver, reject) => {
            let callback: Callback<number> = (err: Error, res: number) => {
                if (err) { reject(err); }
                return resolver(res);
            };
            this.client.incrby(key, by, callback);
        });
    }
    public async Decr(key: string): Promise<number> {
        return new Promise<number>((resolver, reject) => {
            let callback: Callback<number> = (err: Error, res: number) => {
                if (err) { reject(err); }
                return resolver(res);
            };
            this.client.decr(key, callback);
        });
    }
    public async DecrBy(key: string, by: number): Promise<number> {
        return new Promise<number>((resolver, reject) => {
            let callback: Callback<number> = (err: Error, res: number) => {
                if (err) { reject(err); }
                return resolver(res);
            };
            this.client.decrby(key, by, callback);
        });
    }
    // private async Exec(method: string, ...args: any[]): Promise<any> {
    //     return new Promise<number>((resolver, reject) => {
    //         let callback: Callback<number> = (err: Error, res: number) => {
    //             if (err) { reject(err); }
    //             return resolver(res);
    //         };
    //         args.push(callback);
    //         (<any>this.client)[method](args);
    //     });
    // }
}

