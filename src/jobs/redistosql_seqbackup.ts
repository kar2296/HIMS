import type { Job, DoneCallback } from 'bull';
import { BoFactory } from '../Server/Modules/Base/Index';
import { SequenceMastersBo } from '../Server/Modules/General/Business/Index';
import { CronStatusBo } from '../Server/Modules/SystemSettings/Business/Index';
import * as moment from 'moment';

export function RedistosqlSeqbackupJob(job: Job, done: DoneCallback) {
    RunRedistosqlSeqbackupJob(job).then(() => {
        return done();
    }).catch((ex) => {
        return done(ex);
    });
}

async function RunRedistosqlSeqbackupJob(job: Job): Promise<void> {
    console.log(job.data);
    console.log('Redis To SQL Backup started job at - ' + new Date());
    const req = { session: { passport: { user: { SessionContext: { UserId: 1, FacilityId: 1, UserName: 'CRON' } } } } };


    const cronstatusBo = BoFactory.GetBo<CronStatusBo>(CronStatusBo, req as any);
    const cronstatusreq: any = {
        Params: [
            { Key: 0, Value: 3 }, // Redis2SQL - BackUp
        ],
        PageContext: {
            PageSize: 1,
            PageNumber: 1
        }
    };
    const cronstatus: any = await cronstatusBo.GetCronStatus(cronstatusreq);
    if (cronstatus && cronstatus.Data) {
        if (cronstatus.Data.length > 0) {
            const cronstatusdata: any = cronstatus.Data[0];
            let cronlastupdate = moment(cronstatusdata.UpdatedAt).format('YYYYMMDD');
            let serverdate = moment(new Date()).format('YYYYMMDD');
            if (!cronstatusdata.CompletedStatusId || cronlastupdate !== serverdate) {

                const reqCrnSts: any = {
                    Data: {
                        Id: 3,
                        CompletedStatusId: true,
                        UpdatedAt: new Date()
                    }
                };
                await cronstatusBo.UpdateCronStatus(reqCrnSts);

                console.log('Step-1');
                const sequenceMastersBo = BoFactory.GetBo<SequenceMastersBo>(SequenceMastersBo, req as any);
                const seqbackupRequest: any = {
                    Id: null,
                    Params: [],
                    PageContext: { PageSize: -1, PageNumber: 1 }
                };
                await sequenceMastersBo.SyncRedisToSqlSequenceMasters(seqbackupRequest);
                console.log('Redis To SQL Backup job completed job at' + new Date());

                const reqCrnStscmp: any = {
                    Data: {
                        Id: 3,
                        CompletedStatusId: false,
                        UpdatedAt: new Date()
                    }
                };
                await cronstatusBo.UpdateCronStatus(reqCrnStscmp);
                console.log('Checkout Status Completed');


            }
        }
    }



}
