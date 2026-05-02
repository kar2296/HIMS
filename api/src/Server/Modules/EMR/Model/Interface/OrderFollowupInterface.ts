import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface OrderFollowupAttributes extends IAttributes {
    Id: number;
    EncounterId: number;
    PatientId: number;
    FacilityId: number;
    PatientOrderId: number;
    OrderDetailId: number;
    DoctorId: number;
    DepartmentId: number;
    TestTypeId: number;
    TestId: number;
    TestCode: string;
    TestName: string;
    OrderedDate: Date;
    NextFollowupDate: Date;
    FollowupStatusId: number;
    FollowupNotes: string;
    FollowupAppointmentOn: Date;
    Duration: number;
    DurationPeriodId: number;
    FollowupBy: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface OrderFollowupInstance extends Instance<OrderFollowupAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: OrderFollowupAttributes;
}
