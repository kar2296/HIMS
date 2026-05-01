import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface BillingRequestAttributes extends IAttributes {
    Id: number;
    PatientBillId: number;
    PatientBillDetailId: number;
    EncounterId: number;
    EncounterTypeId: number;
    PatientId: number;
    DoctorId: number;
    DepartmentId: number;
    ReferralId: number;
    GuarantorId: number;
    FacilityId: number;
    BillingRequestTypeId: number;
    GuarantorName: string;
    VisitIdentifier: string;
    BillDateTime: Date;
    BillingRequestDateTime: Date;
    BillNumber: string;
    PatientName: string;
    DoctorName: string;
    BillAmount: number;
    BillDiscount: number;
    PaidAmount: number;
    Referral: string;
    BillGeneratedName: string;
    BillGeneratedBy: number;
    PatientBillStatusId: number;
    BillingRequestStatusId: number;
    Status: number;
    Rev: number;
    BillingRequestBy: number;
    IsPartialCancel: boolean;
    TypeId: number;
    BillingRequestAt: Date;
    IsDetailBill: boolean;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface BillingRequestInstance extends Instance<BillingRequestAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: BillingRequestAttributes;
}
