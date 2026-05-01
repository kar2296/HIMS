import * as i from './Interface/Index';
import * as SequelizeStatic  from 'sequelize';
declare global {
    interface Models {
        PatientCertificate: SequelizeStatic.Model<i.PatientCertificateInstance, i.PatientCertificateAttributes>;
        ReferralFeedback: SequelizeStatic.Model<i.ReferralFeedbackInstance, i.ReferralFeedbackAttributes>;
    }
}
