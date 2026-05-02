import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface AppointmentDisplayAttributes extends IAttributes {
    Id: number;
    OrganizationId: number;
    AppointmentId: number;
    FacilityId: number;
    PatientId: number;
    EncounterId: number;
    DepartmentId: number;
    DoctorId: number;
    DisplayNo: number;
    TokenNo: string;
    RoomNoId: number;
    TokenStatusId: number;
    IsAudioRaised: boolean;
    LocationId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface AppointmentDisplayInstance extends Instance<AppointmentDisplayAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AppointmentDisplayAttributes;
}
