import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface VirtualOrderAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    VirtualCategoryId: number;
    VirtualSubCategoryId: number;
    CategoryTypeId: number;
    EncounterId: number;
    EncounterTypeId: number;
    PatientId: number;
    PatientMRN: string;
    PatientName: string;
    PatientMobile: string;
    IsDirectBill: boolean;
    OrderNumber: string;
    OrderRequestDate: Date;
    OrderScheduleDate: Date;
    DoctorId: number;
    DoctorName: string;
    OrderFromId: number;
    OrderToId: number;
    SubDepartmentId: number;
    VirtualOrderStatusId: number;
    OrderCompletedDate: Date;
    OrderPriorityId: number;
    OrderTotal: number;
    VirtualBillId: number;
    VirtualBillStatusId: number;
    VirtualBillNumber: string;
    VirtualBillAmount: number;
    VirtualBillDate: Date;
    PaymentModeId: number;
    RequestTypeId: number;
    AppointmentId: number;
    OrderRemarks: string;
    OrderConsultTypeId: number;
    PayModeHistory?: string;
    OrderModeId: number;
    Symptoms: string;
    StartTime: string;
    EndTime: string;
    GrossAmount: number;
    DiscountAmount: number;
    TotalNetAmount: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface VirtualOrderInstance extends Instance<VirtualOrderAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: VirtualOrderAttributes;
}
