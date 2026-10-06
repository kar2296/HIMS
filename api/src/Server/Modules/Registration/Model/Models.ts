import * as i from './Interface/Index';
import * as SequelizeStatic  from 'sequelize';
declare global {
    interface Models {
        Patient: SequelizeStatic.Model<i.PatientInstance, i.PatientAttributes>;
        PatientMerge: SequelizeStatic.Model<i.PatientMergeInstance, i.PatientMergeAttributes>;
        PatientIdentity: SequelizeStatic.Model<i.PatientIdentityInstance, i.PatientIdentityAttributes>;
        PatientKin: SequelizeStatic.Model<i.PatientKinInstance, i.PatientKinAttributes>;
        FamilyLink: SequelizeStatic.Model<i.FamilyLinkInstance, i.FamilyLinkAttributes>;
		PatientAttachment: SequelizeStatic.Model<i.PatientAttachmentInstance, i.PatientAttachmentAttributes>;
		PatientGuarantor: SequelizeStatic.Model<i.PatientGuarantorInstance, i.PatientGuarantorAttributes>;
		PatientGuarantorGL: SequelizeStatic.Model<i.PatientGuarantorGLInstance, i.PatientGuarantorGLAttributes>;
		EncounterGuarantor: SequelizeStatic.Model<i.EncounterGuarantorInstance, i.EncounterGuarantorAttributes>;
        EncounterGuarantorGL: SequelizeStatic.Model<i.EncounterGuarantorGLInstance, i.EncounterGuarantorGLAttributes>;
        PatientFollowup: SequelizeStatic.Model<i.PatientFollowupInstance, i.PatientFollowupAttributes>;
        PatientArchive: SequelizeStatic.Model<i.PatientArchiveInstance, i.PatientArchiveAttributes>;
        QMS: SequelizeStatic.Model<i.QMSInstance, i.QMSAttributes>;
        PatientDeath: SequelizeStatic.Model<i.PatientDeathInstance, i.PatientDeathAttributes>;
        LocalWellCustomerOrder: SequelizeStatic.Model<i.LocalWellCustomerOrderInstance, i.LocalWellCustomerOrderAttributes>;
    }
}
