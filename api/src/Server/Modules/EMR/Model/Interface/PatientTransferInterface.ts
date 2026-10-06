import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientTransferAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    EncounterId: number;
    TransferDate: Date;
    ReferralDeptartmentId: number;
    DeptartmentComments: string;
    FacilityId: number;
    FacilityDeptartmentId: number;
    FacilityComments: string;
    TransRefDischargeTypeId: number;
    DischargeComments: string;
    ReferOtherFacilityId: number;
    ReferOtherDepartmentId: number;
    ReferOtherComments: string;
    AdmissionDepartmentId: number;
    AdmissionWardId: number;
    FromFcilityId: number;
    FromDepartmentId: number;
    Reviewed: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientTransferInstance extends Instance<PatientTransferAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientTransferAttributes;
}
