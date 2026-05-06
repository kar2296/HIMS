import type { Job, DoneCallback } from 'bull';
import { BoFactory } from '../Server/Modules/Base/Index';
import { EncounterBo } from '../Server/Modules/Visit/Business/Index';
import { EncounterFilters } from '../Server/Modules/Visit/Common/Filters.e';
import { PatientBillsBo } from '../Server/Modules/Billing/Business/Index';
import { CronStatusBo } from '../Server/Modules/SystemSettings/Business/Index';
import * as moment from 'moment';

export function IPBillmodificationJob(job: Job, done: DoneCallback) {
    RunIPBillmodificationJob(job).then(() => {
        return done();
    }).catch((ex) => {
        return done(ex);
    });
}

async function RunIPBillmodificationJob(job: Job): Promise<void> {
    console.log(job.data);
    console.log('ip bill modification started job at - ' + new Date());
    const req = { session: { passport: { user: { SessionContext: { UserId: 1, FacilityId: 1, UserName: 'CRON' } } } } };


    const cronstatusBo = BoFactory.GetBo<CronStatusBo>(CronStatusBo, req as any);
    const cronstatusreq: any = {
        Params: [
            { Key: 0, Value: 2 }, // Bill Modification
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
                        Id: 2,
                        CompletedStatusId: true,
                        UpdatedAt: new Date()
                    }
                };
                await cronstatusBo.UpdateCronStatus(reqCrnSts);



                console.log('Step-1');
                const encounterBO = BoFactory.GetBo<EncounterBo>(EncounterBo, req as any);
                const patientBillsBO = BoFactory.GetBo<PatientBillsBo>(PatientBillsBo, req as any);
                const encRequest: any = {
                    Params: [
                        { Key: EncounterFilters.EncounterTypeId, Value: 2 },
                        { Key: EncounterFilters.AdmissionStatusId, Value: [2, 3, 4] },
                    ],
                    PageContext: { PageSize: -1, PageNumber: 1 }
                };
                const enc: any = await encounterBO.GetEncounters(encRequest);
                let encList: any = enc.Data;
                for (var idx in encList) {
                    var encPerData = encList[idx];
                    if (encPerData.AdmissionStatusId === 2 || encPerData.AdmissionStatusId === 3
                        || encPerData.AdmissionStatusId === 4) {
                        if (!encPerData.DischargeDate && !encPerData.IsBillFinalized && !encPerData.IsBillLock) {
                            console.log('VisitIdentifier:- '+ encPerData.VisitIdentifier);
                            const billRequest: any = {
                                Id: encPerData.Id,
                                PageContext: { PageSize: -1, PageNumber: 1 }
                            };
                            await patientBillsBO.PopulateInpatientBills(billRequest);
                        }
                    }
                }
                console.log('ip bill modification job completed job at' + new Date());


                const reqCrnStscmp: any = {
                    Data: {
                        Id: 2,
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
