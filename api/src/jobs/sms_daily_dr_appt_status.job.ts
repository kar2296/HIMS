import { Job, DoneCallback } from 'bull';
import { BoFactory } from '../Server/Modules/Base/Index';
import { AppointmentBo } from '../Server/Modules/Appointment/Business/Index';

export function SMSDailyDrApptStautsJob(job: Job, done: DoneCallback) {
    RunSMSDailyDrApptStautsJob(job).then(() => {
        return done();
    }).catch((ex) => {
        return done(ex);
    });
}

async function RunSMSDailyDrApptStautsJob(job: Job): Promise<void> {
    console.log(job.data);
    console.log('Dr Appointment Status SMS started job at - ' + new Date());
    const req = { session: { passport: { user: { SessionContext: { UserId: 1, FacilityId: 1 } } } } };
    console.log('Step-1');
    const appointmentBo = BoFactory.GetBo<AppointmentBo>(AppointmentBo, req as any);
    let frmDt = new Date();
    frmDt.setDate(frmDt.getDate() + 1); // Tomorrow appointments send sms today .
    frmDt.setHours(0, 0, 0);
    let toDt = new Date();
    toDt.setDate(toDt.getDate() + 1); // Tomorrow appointments send sms today .
    toDt.setHours(23, 59, 59);
    await appointmentBo.sendDrAppointmentStatusSMS(frmDt, toDt);
    console.log('completed job at' + new Date());
}
