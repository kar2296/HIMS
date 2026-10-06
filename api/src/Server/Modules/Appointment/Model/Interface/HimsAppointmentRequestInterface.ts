import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface AppointmentRequestAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    FacilityId: number;
    DepartmentId: number;
    DoctorId: number;
    ResourceId: number;
    AppointmentTypeId: number;
    AppointmentDate: Date;
    StartTime: string;
    EndTime: string;
    AppointmentId: number;
    RequestMessage: string;
    AppointmentRequestStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface AppointmentRequestInstance extends Instance<AppointmentRequestAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AppointmentRequestAttributes;
}
