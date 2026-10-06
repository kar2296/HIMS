import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface VirtualConferenceAttributes extends IAttributes {
    Id: number;
    OrganizationId: number;
    FacilityId: number;
    ConferenceScheduleDate: Date;
    PatientId: number;
    EncounterId: number;
    AppointmentId: number;
    OrderId: number;
    ParticipantTypeId: number;
    ConferenceName: string;
    ConferenceDate: Date;
    ConferenceTime: string;
    Duration: number;
    AllowRecording: boolean;
    Description: string;
    DoctorId: number;
    DoctorName: string;
    StartTime: Date;
    EndTime: Date;
    ConferenceStatusId: number;
    ConferenceRoomId: string;
    ActualDuration: string;
    LockSettingsDisablePrivateChat: boolean;
    LockSettingsDisableCam: boolean;
    WebcamsOnlyForModerator: boolean;
    IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface VirtualConferenceInstance extends Instance<VirtualConferenceAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: VirtualConferenceAttributes;
}
