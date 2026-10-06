import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ClaimSubmissionDetailsAttributes extends IAttributes {
    Id: number;
    ClaimSubmissionId:number;
    GuarantorId:number;
    PatientId:number;
    PatientBillId:number;
    IsClaimCoveringLetter: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    FacilityId: number;
}

export interface ClaimSubmissionDetailsInstance extends Instance<ClaimSubmissionDetailsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ClaimSubmissionDetailsAttributes;
}
