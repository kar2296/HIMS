import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ClaimSubmissionAttributes extends IAttributes {
    Id: number;
    ClaimNumber: string;
    GuarantorId: number;
    FacilityId: number;
    GuarantorTypeId: number;
    ClaimSubmissionStatusId: number;
    SubmittedOn: Date;
    SubmittedById: number;
    IsClaimCoveringLetter: boolean;
    DispatchedOn: Date;
    TrackingNumber: string;
    DispatchedById: number;
    ClaimAmount: number;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    DepartmentId: number;
    CNAmount: number;
}

export interface ClaimSubmissionInstance extends Instance<ClaimSubmissionAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ClaimSubmissionAttributes;
}
