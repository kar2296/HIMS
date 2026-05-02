import { config } from 'dotenv';
config();

import './Global';
import { Bootstrap } from './Bootstrap';
if (process.env.NODE_ENV !== 'production') {
    debugger;
}
let app = new Bootstrap();
app.Init();

import * as Bull from 'bull';
import { CacheConfig } from './config/CacheConfig';
import { OPCheckoutJob } from './jobs';
import { IPBillmodificationJob } from './jobs';

/////import { RedistosqlSeqbackupJob } from './jobs';

//////// import { SMSFollowUpAppointmentJob } from './jobs';
//////// import { SMSDailyDrApptStautsJob } from './jobs';
//////// import { SMSFollowUpPrescriptionJob } from './jobs';

const queue1 = new Bull('OPCheckOut', {
    redis: {
        db: 0,
        port: CacheConfig.port,
        host: CacheConfig.host,
        password: ''
    }
});
const queue2 = new Bull('IPBillModification', {
    redis: {
        db: 0,
        port: CacheConfig.port,
        host: CacheConfig.host,
        password: ''
    }
});

// const queue5 = new Bull('RedistosqlSeqbackupJob', {
//     redis: {
//         db: 0,
//         port: CacheConfig.port,
//         host: CacheConfig.host,
//         password: ''
//     }
// });

// const queue3 = new Bull('SMSFollowUpAppointmentJob', {
//     redis: {
//         db: 0,
//         port: CacheConfig.port,
//         host: CacheConfig.host,
//         password: ''
//     }
// });

//////////////// const queue4 = new Bull('SMSDailyDrApptStautsJob', {
////////////////     redis: {
////////////////         db: 0,
////////////////         port: CacheConfig.port,
////////////////         host: CacheConfig.host,
////////////////         password: ''
////////////////     }
//////////////// });

//////////////// const queue6 = new Bull('SMSFollowUpPrescriptionJob', {
////////////////     redis: {
////////////////         db: 0,
////////////////         port: CacheConfig.port,
////////////////         host: CacheConfig.host,
////////////////         password: ''
////////////////     }
//////////////// });

console.log(CacheConfig);
queue1.process(OPCheckoutJob);
queue1.add({ name: 'daily_1_am' }, { repeat: { cron: '0 0 1 * * *' } })
    .catch((err) => {
        console.error(err);
    });

queue2.process(IPBillmodificationJob);
queue2.add({ name: 'daily_2_am' }, { repeat: { cron: '0 0 2 * * *' } })
    .catch((err) => {
        console.error(err);
    });

// queue3.process(RedistosqlSeqbackupJob);
// queue2.add({ name: 'every_1_minutes' }, { repeat: { cron: '* */1 * * * *' } })
//     .catch((err) => {
//         console.error(err);
//     });
// queue5.process(RedistosqlSeqbackupJob);
// queue5.add({ name: 'every_1_minutes' }, { repeat: { cron: '* */1 * * * *' } })
//     .catch((err) => {
//         console.error(err);
//     });

////////////////////// queue3.process(SMSFollowUpAppointmentJob);
////////////////////// queue3.add({ name: 'every_day_evening' }, { repeat: { cron: '0 30 17 * * *' } })
//////////////////////     .catch((err) => {
//////////////////////         console.error(err);
//////////////////////     });

////////////////////// queue4.process(SMSDailyDrApptStautsJob);
////////////////////// queue4.add({ name: 'every_day_evening' }, { repeat: { cron: '0 30 17 * * *' } })
//////////////////////     .catch((err) => {
//////////////////////         console.error(err);
//////////////////////     });

////////////////////// queue6.process(SMSFollowUpPrescriptionJob);
////////////////////// queue6.add({ name: 'every_day_evening' }, { repeat: { cron: '0 30 17 * * *' } })
//////////////////////     .catch((err) => {
//////////////////////         console.error(err);
//////////////////////     });


