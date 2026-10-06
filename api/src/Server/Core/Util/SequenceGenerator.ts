import { Redis } from '../Wrapper/Index';
import * as moment from 'moment';

export class SequenceGenerator {
    private static Redis: Redis = Redis.Instance;
    public static async SetSequence(key: string, value: number): Promise<boolean> {
        return SequenceGenerator.Redis.Set(key, value).catch(err => { throw err; });
    }
    public static async SetMultipleSequence(options: { key: string, value: number }[]): Promise<void> {
        let promises: any[] = [];
        options.forEach(item => {
            promises.push(SequenceGenerator.SetSequence(item.key, item.value));
        });
        // await promises;
        await Promise.all(promises);
    }
    public static async GetSequence(key: string): Promise<number> {
        return await SequenceGenerator.Redis.Get<number>(key);
    }

public static async Next(option: {
        key: string, IncrBy?: number, pattern?:
        string, prefix?: string, suffix?: string,
        isdailyreset: boolean,
        seqbaseid: number
    }): Promise<any> {
        if (option.isdailyreset) {
        let currentdt = new Date();
        if (option.prefix) {
            if (option.prefix === 'YYYYMMDD') {
                option.prefix = moment(currentdt).format('YYYYMMDD');
            } else if (option.prefix === 'YYMMDD') {
                option.prefix = moment(currentdt).format('YYMMDD');
            } else if (option.prefix === 'YYYYMM') {
                option.prefix = moment(currentdt).format('YYYYMM');
            } else if (option.prefix === 'YYMM') {
                option.prefix = moment(currentdt).format('YYMM');
            } else if (option.prefix === 'YYYY') {
                option.prefix = moment(currentdt).format('YYYY');
            } else if (option.prefix === 'YY') {
                option.prefix = moment(currentdt).format('YY');
            }
        }
        let LastServedIdentifier = 'Reset' + option.key;
        let LastServed: any = await SequenceGenerator.Redis.Get(LastServedIdentifier);
        let CurIdentifier = Number(moment(currentdt).format('YYYYMMDD'));
        if (LastServed && LastServed !== CurIdentifier) {
            await SequenceGenerator.Redis.Set(LastServedIdentifier, CurIdentifier);
            await SequenceGenerator.Redis.Set(option.key, option.seqbaseid);
        }
        }
        let val = option.IncrBy > 1
            ? await SequenceGenerator.Redis.IncrBy(option.key, option.IncrBy).catch(err => { throw err; })
            : await SequenceGenerator.Redis.Incr(option.key).catch(err => { throw err; });
        return option.prefix + val; //TODO: Need to extend the implementation
    }
    // public static async Next(option: {
    //     key: string, IncrBy?: number, pattern?:
    //     string, prefix?: string, suffix?: string,
    //     isdailyreset: boolean,
    //     seqbaseid: number
    // }): Promise<any> {
    //     if (option.isdailyreset) {
    //         let currentdt = new Date();
    //         if (option.prefix) {
    //             if (option.prefix === 'YYYYMMDD') {
    //                 option.prefix = moment(currentdt).format('YYYYMMDD');
    //             } else if (option.prefix === 'YYMMDD') {
    //                 option.prefix = moment(currentdt).format('YYMMDD');
    //             } else if (option.prefix === 'YYYYMM') {
    //                 option.prefix = moment(currentdt).format('YYYYMM');
    //             } else if (option.prefix === 'YYMM') {
    //                 option.prefix = moment(currentdt).format('YYMM');
    //             } else if (option.prefix === 'YYYY') {
    //                 option.prefix = moment(currentdt).format('YYYY');
    //             } else if (option.prefix === 'YY') {
    //                 option.prefix = moment(currentdt).format('YY');
    //             }
    //         }
    //         let LastServedIdentifier = 'Reset' + option.key;
    //         let LastServed: any = await SequenceGenerator.Redis.Get(LastServedIdentifier);
    //         let CurIdentifier = Number(moment(currentdt).format('YYYYMMDD'));
    //         if (LastServed && LastServed !== CurIdentifier) {
    //             await SequenceGenerator.Redis.Set(LastServedIdentifier, CurIdentifier);
    //             await SequenceGenerator.Redis.Set(option.key, option.seqbaseid);
    //         }
    //     }
    //     let val = option.IncrBy > 1
    //         ? await SequenceGenerator.Redis.IncrBy(option.key, option.IncrBy).catch(err => { throw err; })
    //         : await SequenceGenerator.Redis.Incr(option.key).catch(err => { throw err; });
    //     return option.prefix + val; //TODO: Need to extend the implementation
    // }
    // public static async Next(option: {
    //     key: string;
    //     IncrBy?: number;
    //     pattern?: string;
    //     prefix?: string;
    //     suffix?: string;
    //     isdailyreset: boolean;
    //     seqbaseid: number;
    //     // padLength?: number;  // e.g., 4 for 0001
    //     // delimiter?: string;  // e.g., '-' for 20240608-0001
    // }): Promise<any> {

    //     const currentdt = new Date();
    //     let prefix = option.prefix || '';
    //     let lockKey = `LOCK:${option.key}`;

    //     // Handle formatted prefix
    //     switch (option.prefix) {
    //         case 'YYYYMMDD':
    //             prefix = moment(currentdt).format('YYYYMMDD');
    //             break;
    //         case 'YYMMDD':
    //             prefix = moment(currentdt).format('YYMMDD');
    //             break;
    //         case 'YYYYMM':
    //             prefix = moment(currentdt).format('YYYYMM');
    //             break;
    //         case 'YYMM':
    //             prefix = moment(currentdt).format('YYMM');
    //             break;
    //         case 'YYYY':
    //             prefix = moment(currentdt).format('YYYY');
    //             break;
    //         case 'YY':
    //             prefix = moment(currentdt).format('YY');
    //             break;
    //     }

    //     // Daily reset logic
    //     // if (option.isdailyreset) {
    //     if (option.isdailyreset) {
    //         const LastServedIdentifier = `Reset:${option.key}`;
    //         const todayId = Number(moment(currentdt).format('YYYYMMDD'));
    //         const lastServed = await SequenceGenerator.Redis.Get(LastServedIdentifier);

    //         if (lastServed !== todayId.toString()) {
    //             // Acquire lock before resetting
    //             // const lockAcquired = await SequenceGenerator.Redis.Set(lockKey, '1', 'NX', 'PX', 5000);
    //             // if (lockAcquired === 'OK') {
    //             try {
    //                 await SequenceGenerator.Redis.Set(LastServedIdentifier, todayId);
    //                 await SequenceGenerator.Redis.Set(option.key, option.seqbaseid);
    //             } finally {
    //                 await SequenceGenerator.Redis.Del(lockKey);
    //             }
    //             // }
    //         }
    //     }

    //     // Increment sequence
    //     let val: number;
    //     if (option.IncrBy && option.IncrBy > 1) {
    //         val = await SequenceGenerator.Redis.IncrBy(option.key, option.IncrBy);
    //     } else {
    //         val = await SequenceGenerator.Redis.Incr(option.key);
    //     }
    //     return option.prefix + val;
    //     // const paddedVal = String(val).padStart(option.padLength || 4, '0');
    //     // const delimiter = option.delimiter || '';

    //     // return [prefix, paddedVal].filter(Boolean).join(delimiter);
    // }
    // const lockKey = `LOCK:${option.key}`;
    // const lockAcquired = await Redis.Set(lockKey, '1', 'NX', 'PX', 3000); // 3s lock

    // if (lockAcquired === 'OK') {
    //   try {
    //     // Safe to reset
    //     await Redis.Set(LastServedIdentifier, CurIdentifier);
    //     await Redis.Set(option.key, option.seqbaseid);
    //   } finally {
    //     await Redis.Del(lockKey);
    //   }
    // }
}
