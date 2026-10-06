import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface EncounterGuarantorGLAttributes extends IAttributes {
    Id: number;
    EncounterId: number;
    FacilityId: number;
    OrganizationId: number;
    PatientId: number;
    EncounterGuarantorId: number;
    GuarantorName: string;
    GuarantorTypeId: number;
    GuarantorLetterNo: string;
    GuarantorLetterDate: Date;
    GLReferenceNumber: string;
    GLDate: Date;
    MaxNoOfdays: string;
    CurrentVisitNumber: string;
    MaximumVisitNumber: string;
    DurationMedicine: string;
    GLLimit: number;
    ConsumedLimit: number;
    BalanceLimit: number;
    RandB: string;
    ActiveFrom: Date;
    ActiveTo: Date;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface EncounterGuarantorGLInstance extends Instance<EncounterGuarantorGLAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: EncounterGuarantorGLAttributes;
}
