import {Redis} from './RedisWrapper';
import {CacheConfig} from '../../../config/index';

const logger = (err: Error): void => {
    console.error(err);
};

describe('Redis Client', () => {
    let redis: Redis = new Redis(CacheConfig);
    describe('Set, Get, Del Command - Basic Usage', () => {
        // beforeEach(() => {  });
        it('It should be set a key into cache', async (done) => {
            let setRes = await redis.Set('key1', 'value1').catch(logger);
            expect(setRes).toEqual(true);
            let getRes = await redis.Get('key1').catch(logger);
            expect(getRes).toEqual('value1');
            let delRes = await redis.Del('key1').catch(logger);
            expect(delRes).toEqual(1);
            done();
        });
        // it('It should be retrive the value from cache', async (done) => {
        //     let getRes = await redis.Get('key1').catch(logger);
        //     expect('value1').toEqual(getRes);
        //     done();
        // });
        // it('It should be delete the same', async (done) => {
        //     let delRes = await redis.Del('key1').catch(logger);
        //     expect(1).toEqual(delRes);
        //     done();
        // });
    });
    describe('HSet, HGet, HDel Command - Basic Usage', () => {
        // beforeEach(() => {  });
        it('It should be set region and key into cache', async (done) => {
            let setRes = await redis.HSet('key1', 'value1', 'region').catch(logger);
            expect(1).toEqual(setRes);
             let getRes = await redis.HGet('key1', 'region').catch(logger);
            expect('value1').toEqual(getRes);
              let delRes = await redis.HDel('key1', 'region').catch(logger);
            expect(1).toEqual(delRes);
            done();
        });
        // it('It should be retrive the value from cache', async (done) => {
        //     let getRes = await redis.HGet('key1', 'region').catch(logger);
        //     expect('value1').toEqual(getRes);
        //     done();
        // });
        // it('It should be delete the same', async (done) => {
        //     let delRes = await redis.HDel('key1', 'region').catch(logger);
        //     expect(1).toEqual(delRes);
        //     done();
        // });
    });
});

