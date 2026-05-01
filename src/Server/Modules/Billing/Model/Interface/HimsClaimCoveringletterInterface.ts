import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ClaimCoveringletterAttributes extends IAttributes {
    Id: number;
    ClaimNumber: string;
    PatientId: number;
    EncounterId: number;
    FacilityId: number;
    ClaimSubmissionId: number;
    ClaimSubmissionStatusId: number;
    IsClaimCoveringLetter: boolean;
    LetterDate: Date;
    GuarantorId: number;
    GuarantorTypeId: number;
    ClaimCoveringletterStatusId: number;
    ClaimSubmissionDetailId: number;
    SubmittedOn: Date;
    submittedById: number;
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

export interface ClaimCoveringletterInstance extends Instance<ClaimCoveringletterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ClaimCoveringletterAttributes;
}
