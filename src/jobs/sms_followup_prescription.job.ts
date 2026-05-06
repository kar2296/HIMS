import type { Job, DoneCallback } from 'bull';
import { BoFactory } from '../Server/Modules/Base/Index';
import { PrescriptionBo } from '../Server/Modules/EMR/Business/Index';

export function SMSFollowUpPrescriptionJob(job: Job, done: DoneCallback) {
    RunSMSFollowUpPrescriptionJob(job).then(() => {
        return done();
    }).catch((ex) => {
        return done(ex);
    });
}

async function RunSMSFollowUpPrescriptionJob(job: Job): Promise<void> {
    console.log(job.data);
    console.log('FollowUp Appointment SMS started job at - ' + new Date());
    const req = { session: { passport: { user: { SessionContext: { UserId: 1 } } } } };
    console.log('Step-1');
    const prescriptionBo = BoFactory.GetBo<PrescriptionBo>(PrescriptionBo, req as any);
    let frmFollowUpDt = new Date();
    frmFollowUpDt.setDate(frmFollowUpDt.getDate() + 1); // Tomorrow FollowUp appointments send sms today .
    frmFollowUpDt.setHours(0, 0, 0);
    let toFollowUpDt = new Date();
    toFollowUpDt.setDate(toFollowUpDt.getDate() + 1); // Tomorrow FollowUp appointments send sms today .
    toFollowUpDt.setHours(23, 59, 59);
    await prescriptionBo.setFollowUpPrescriptionSMS(frmFollowUpDt, toFollowUpDt);
    console.log('completed job at' + new Date());
}
