import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ProcedureOrderAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    DepartmentId: number;
    SubDepartmentId: number;
    ServiceCategoryId: number;
    PatientId: number;
    PatientGuarantorId: number;
    ServiceRateCategoryId: number;
    EncounterId: number;
    EncounterTypeId: number;
    DoctorId: number;
    ConsultationId: number;
    OrderNumber: string;
    OrderRequestDate: Date;
    OrderScheduleDate: Date;
    OrderFromId: number;
    OrderToId: number;
    OrderStatusId: number;
    OrderCompletedDate: Date;
    OrderPriorityId: number;
    OrderTotal: number;
    OrderNotes: string;
    OrderComments: string;
    IsDirectBill: boolean;
    BillingStatusId: number;
    PatientBillStatusId: number;
    PatientBillId: number;
    BillNumber: string;
    BillAmount: number;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ProcedureOrderInstance extends Instance<ProcedureOrderAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ProcedureOrderAttributes;
}
