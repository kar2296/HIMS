import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientCreditNoteAttributes extends IAttributes {
    Id: number;
    CreditNoteDateTime: Date;
    CreditNoteIdentifier: string;
    FacilityId: number;
    OrganizationId: number;
    PatientId: number;
    CreditNoteTypeId: number;
    EncounterId: number;
    EncounterTypeId: number;
    PatientName: string;
    PatientReceiptId: number;
    PatientBillId: number;
    CreditNoteAmount: number;
    DepartmentID: number;
    PaymentcounterID: number;
    GuarantorId: number;
    GuarantorTypeId: number;
    RefundGeneratedById: number;
    CreditNoteApprovedById: number;
    DoctorId: number;
    Comments: string;
    CancelReason: string;
    CreditNoteStatusId: number;
    RoundOffValue: number;
    DebitNoteId: number;
    AdjustedAmount: number;
    PaymentTypeId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientCreditNoteInstance extends Instance<PatientCreditNoteAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientCreditNoteAttributes;
}
