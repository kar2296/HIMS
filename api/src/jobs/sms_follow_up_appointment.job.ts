import { Job, DoneCallback } from 'bull';
import { BoFactory } from '../Server/Modules/Base/Index';
import { PatientTrackerBo } from '../Server/Modules/Appointment/Business/Index';

export function SMSFollowUpAppointmentJob(job: Job, done: DoneCallback) {
    RunSMSFollowUpAppointmentJob(job).then(() => {
        return done();
    }).catch((ex) => {
        return done(ex);
    });
}

async function RunSMSFollowUpAppointmentJob(job: Job): Promise<void> {
    console.log(job.data);
    console.log('FollowUp Appointment SMS started job at - ' + new Date());
    const req = { session: { passport: { user: { SessionContext: { UserId: 1, FacilityId: 1 } } } } };
    console.log('Step-1');
    const patientTrackerBo = BoFactory.GetBo<PatientTrackerBo>(PatientTrackerBo, req as any);
    let frmFollowUpDt = new Date();
    frmFollowUpDt.setDate(frmFollowUpDt.getDate() + 1); // Tomorrow FollowUp appointments send sms today .
    frmFollowUpDt.setHours(0, 0, 0);
    let toFollowUpDt = new Date();
    toFollowUpDt.setDate(toFollowUpDt.getDate() + 1); // Tomorrow FollowUp appointments send sms today .
    toFollowUpDt.setHours(23, 59, 59);
    await patientTrackerBo.setFollowUpAppointmentSMS(frmFollowUpDt, toFollowUpDt);
    console.log('completed job at' + new Date());
}
