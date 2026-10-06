import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface TreatmentPlanFollowupAttributes extends IAttributes {
    Id: number;
    EncounterId: number;
    PatientId: number;
    FacilityId: number;
    TreatmentPlanId: number;
    TreatmentPlanDetailId: number;
    DoctorId: number;
    DepartmentId: number;
    ServiceCategoryId: number;
    ServiceItemId: number;
    ServiceCode: string;
    ServiceName: string;
    TreatmentRequestDate: Date;
    TreatmentScheduleDate: Date;
    FollowupStatusId: number;
    FollowupNotes: string;
    NextFollowupOn: Date;
    FollowupBy: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface TreatmentPlanFollowupInstance extends Instance<TreatmentPlanFollowupAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: TreatmentPlanFollowupAttributes;
}
