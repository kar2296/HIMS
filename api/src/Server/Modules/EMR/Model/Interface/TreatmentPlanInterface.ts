import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface TreatmentPlanAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    DepartmentId: number;
    PatientId: number;
    EncounterId: number;
    EncounterTypeId: number;
    DoctorId: number;
    ConsultationId: number;
    PlanNumber: string;
    PlanRequestDate: Date;
    PlanScheduledFrom: Date;
    PlanScheduledTo: Date;
    NoOfDays: string;
    IntervalDays: string;
    PlanStatusId: number;
    PlanCompletedDate: Date;
    PlanPriorityId: number;
    TotalAmount: number;
    ServiceRateCategoryId: number;
    BillingStatusId: number;
    PatientBillId: number;
    BillNumber: string;
    BillAmount: number;
    Comments: string;
    IsPaid: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface TreatmentPlanInstance extends Instance<TreatmentPlanAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: TreatmentPlanAttributes;
}
