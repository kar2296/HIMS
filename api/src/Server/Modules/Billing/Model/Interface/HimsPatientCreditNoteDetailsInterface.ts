import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientCreditNoteDetailsAttributes extends IAttributes {
    Id: number;
    CreditNoteDetailDateTime: Date;
    PatientCreditNoteId: number;
    FacilityId: number;
    OrganizationId: number;
    PatientId: number;
    ServiceId: number;
    ServiceName: string;
    ServiceAmount: number;
    Discount: number;
    NetAmount: number;
    CreditNoteTypeId: number;
    CreditNoteAmount: number;
    DepartmentID: number;
    PaymentcounterID: number;
    DoctorId: number;
    PatientBillId: number;
    PatientBillDetailId: number;
    PharmacyReturnId: number;
    Comments: string;
    RoundOffValue: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientCreditNoteDetailsInstance extends Instance<PatientCreditNoteDetailsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientCreditNoteDetailsAttributes;
}
