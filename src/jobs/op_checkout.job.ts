import type { Job, DoneCallback } from 'bull';
import { BoFactory } from '../Server/Modules/Base/Index';
import { AppointmentBo, PatientTrackerBo } from '../Server/Modules/Appointment/Business/Index';
import { CronStatusBo } from '../Server/Modules/SystemSettings/Business/Index';
import * as moment from 'moment';

export function OPCheckoutJob(job: Job, done: DoneCallback) {
    RunOPCheckoutJob(job).then(() => {
        return done();
    }).catch((ex) => {
        return done(ex);
    });
}

async function RunOPCheckoutJob(job: Job): Promise<void> {
    console.log(job.data);
    console.log('op checkout started job at - ' + new Date());
    const req = {
        session: {
            passport: {
                user: {
                    SessionContext: {
                        UserId: 1, FacilityId: 1, UserName: 'CRON'
                    }
                }
            }
        }
    };

    const cronstatusBo = BoFactory.GetBo<CronStatusBo>(CronStatusBo, req as any);
    const cronstatusreq: any = {
        Params: [
            { Key: 0, Value: 1 }, // OP Checkout
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

                console.log('Step-1');
                const apptBO = BoFactory.GetBo<AppointmentBo>(AppointmentBo, req as any);
                var CurrentDate = new Date();
                // add a day
                CurrentDate.setDate(CurrentDate.getDate() - 1); // Previous Days for all checked in patients
                const apptRequest: any = {
                    Params: [
                        { Key: 7, Value: 6 }, //appt status
                        { Key: 10, Value: CurrentDate }, //appt status
                    ],
                    PageContext: {
                        PageSize: 100000,
                        PageNumber: 1
                    }
                };
                const appts: any = await apptBO.GetAppointments(apptRequest);
                let appointmentsList: any = appts.Data;
                let apptsToCheckout: Array<any> = [];
                if (appointmentsList && appointmentsList.length) {

                    const reqCrnSts: any = {
                        Data: {
                            Id: 1,
                            CompletedStatusId: true,
                            UpdatedAt: new Date()
                        }
                    };
                    await cronstatusBo.UpdateCronStatus(reqCrnSts);
                    // if (process.env.NODE_ENV !== 'production') {
                    //     debugger;
                    // }
                    console.log('Checkout Status Started');

                    console.log(appointmentsList.length);
                    for (var idx in appointmentsList) {
                        var item = appointmentsList[idx];
                        var newItem = { AppointmentId: item.Id, PatientId: item.PatientId };
                        apptsToCheckout.push(newItem);
                    }
                    console.log('appointmentsList length');
                    console.log(appointmentsList.length);
                    let baseReq: any = { Data: apptsToCheckout };
                    const patientTrackerBo = BoFactory.GetBo<PatientTrackerBo>(PatientTrackerBo, req as any);
                    await patientTrackerBo.OPAutoCheckout(baseReq);
                    // if (process.env.NODE_ENV !== 'production') {
                    //     debugger;
                    // }
                    const reqCrnStscmp: any = {
                        Data: {
                            Id: 1,
                            CompletedStatusId: false,
                            UpdatedAt: new Date()
                        }
                    };
                    await cronstatusBo.UpdateCronStatus(reqCrnStscmp);
                    console.log('Checkout Status Completed');


                    console.log('OP Checkout job completed job at' + new Date());

                }
            }
        }
    }

}
