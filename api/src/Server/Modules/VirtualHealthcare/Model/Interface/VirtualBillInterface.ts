import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface VirtualBillAttributes extends IAttributes {
    Id: number;
    OrganizationId: number;
    FacilityId: number;
    DepartmentId: number;
    VirtualCategoryId: number;
    VirtualSubCategoryId: number;
    CategoryTypeId: number;
    BillNumber: string;
    BillDateTime: Date;
    VirtualBillTypeId: number;
    PatientId: number;
    PatientName: string;
    PatientMrn: string;
    Mobile: string;
    EncounterId: number;
    EncounterTypeId: number;
    BillAmount: number;
    NetAmount: number;
    BillDiscount: number;
    DiscountPercentage: number;
    BillDiscountTypeId: number;
    DiscountApprovedBy: number;
    BillDiscountModeId: number;
    DiscountModeValue: number;
    RoundOffValue: number;
    VirtualBillStatusId: number;    // ✅ fixed typo
    BilledCounter: number;          // ✅ lowercase
    PaidAmount: number;
    IsPaidFully: boolean;
    ReturnedAmount: number;
    OutStandingAmount: number;
    BillGeneratedBy: number;
    BillApprovedBy: number;
    DoctorId: number;
    DoctorName: string;
    CancelAmount: number;
    CancelReason: string;
    CancelledBy: number;
    IsManualBill: boolean;
    ManualBillNumber: string;
    ManualBillDate: Date;
    ManualBillComments: string;
    ToBeRefunded: number;
    RefundAmount: number;
    VirtualOrderId: number;
    PaymentModeId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface VirtualBillInstance extends Instance<VirtualBillAttributes> {
    dataValues: VirtualBillAttributes;
}
