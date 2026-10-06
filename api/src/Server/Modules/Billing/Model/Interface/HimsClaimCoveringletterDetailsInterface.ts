import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ClaimCoveringletterDetailsAttributes extends IAttributes {
    Id: number;
    ClaimCoveringletterId: number;
    GuarantorId: number;
    GuarantorChecklistId: number;
    Title: string;
    Description: string;
    ChecklistValue: string;
    EncounterId: number;
    FacilityId: number;
    Date: Date;
    Comments: string;
    PatientId: number;
    PatientBillId: number;
    IsClaimCoveringLetter: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ClaimCoveringletterDetailsInstance extends Instance<ClaimCoveringletterDetailsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ClaimCoveringletterDetailsAttributes;
}
