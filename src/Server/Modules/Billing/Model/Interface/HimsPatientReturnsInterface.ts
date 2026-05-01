import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientReturnsAttributes extends IAttributes {
    Id: number;
    PatientBillId: number;
    ReturnNumber: string;
    BillNumber: string;
    ReturnDateTime: Date;
    BillDateTime: Date;
    ReturnTypeId: number;
    ReturnPriorityId: number;
    ReturnAmount: number;
    FreeReturnAmount: number;
    RoundOffValue: number;
    ReturnedCounter: number;
    RefundedAmount: number;
    FreeRefundedAmount: number;
    IsRefundedFully: boolean;
    ToBeRefundAmount: number;
    ServiceTax: number;
    EducationCess: number;
    GrossAmount: number;
    DiscountModeId: number;
    DiscountAmount: number;
    DiscountApprovedBy: number;
    GstAmount: number;
    NetAmount: number;
    InGstAmount: number;
    CGstAmount: number;
    SGstAmount: number;
    ReturnReason: string;
    ReturnGeneratedBy: number;
    ReturnApprovedBy: number;
    PatientReturnStatusId: number;
    PharmacyReturnTypeId: number;
    OrganizationId: number;
    FacilityId: number;
    DepartmentId: number;
    StoreMasterId: number;
    PatientId: number;
    PatientName: string;
    PatientTypeId: number;
    EncounterId: number;
    EncounterTypeId: number;
    GuarantorId: number;
    GuarantorTypeId: number;
    GuarantorName: string;
    DoctorId: number;
    ReferralId: number;
    ReferralName: string;
    DoctorName: string;
    PatientAddress: string;
    Comments: string;
    NetPatientAmount: number;
    NetInsuranceAmount: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    MobileNo: number;
    PatientMRN: string;
}

export interface PatientReturnsInstance extends Instance<PatientReturnsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientReturnsAttributes;
}
