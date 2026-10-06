import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientAccountsAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    EncounterId: number;
    VisitNumber: string;
    TransactionTypeId: number;
    TransactionId: number;
    TransactionNumber: string;
    TransactionDate: Date;
    BillAmount: number;
    PaidAmount: number;
    AdjustedAmount: number;
    UnAdjustedAmount: number;
    DueAmount: number;
    DebitAmount: number;
    CreditAmount: number;
    ClosingBalance: number;
    IsAdvance: boolean;
	IsAdvanceAdjusted: boolean;
    IsDueCollection: boolean;
    DepartmentId: number;
    LocationId: number;
    FacilityId: number;
    OrganisationId: number;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientAccountsInstance extends Instance<PatientAccountsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientAccountsAttributes;
}
