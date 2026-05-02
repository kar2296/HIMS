import * as i from './Interface/Index';
import * as SequelizeStatic from 'sequelize';
declare global {
    interface Models {
        Encounter: SequelizeStatic.Model<i.EncounterInstance, i.EncounterAttributes>;
        EncounterMLC: SequelizeStatic.Model<i.EncounterMLCInstance, i.EncounterMLCAttributes>;
        EncounterMLCOfficer: SequelizeStatic.Model<i.EncounterMLCOfficerInstance, i.EncounterMLCOfficerAttributes>;
        EncounterDoctor: SequelizeStatic.Model<i.EncounterDoctorInstance, i.EncounterDoctorAttributes>;
        EncounterIPPackage: SequelizeStatic.Model<i.EncounterIPPackageInstance, i.EncounterIPPackageAttributes>;
        EncounterIPPackageDetail: SequelizeStatic.Model<i.EncounterIPPackageDetailInstance, i.EncounterIPPackageDetailAttributes>;
        EncounterIPPackageServiceInclusion: SequelizeStatic.Model<i.EncounterIPPackageServiceInclusionInstance,
            i.EncounterIPPackageServiceInclusionAttributes>;
        EncounterIPPackageServiceExclusion: SequelizeStatic.Model<i.EncounterIPPackageServiceExclusionInstance,
            i.EncounterIPPackageServiceExclusionAttributes>;
        EncounterIPPackageServiceNonMedical: SequelizeStatic.Model<i.EncounterIPPackageServiceNonMedicalInstance,
            i.EncounterIPPackageServiceNonMedicalAttributes>;
        PatientComment: SequelizeStatic.Model<i.PatientCommentInstance, i.PatientCommentAttributes>;
    }
}
