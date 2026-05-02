import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientTrackerAttributes extends IAttributes {
    Id: number;
    PrevAppointmentId: number;
    ParentTrackId: number;
    PatientId: number;
    AppointmentId: number;
    AppointmentName: string;
    EncounterId: number;
    DoctorId: number;
    FacilityId: number;
    AssignedRoomId: number;
    AssignedRoomName: string;
    AssignedGroupId: number;
    AssignedGroupName: string;
    AssignedUserId: number;
    AssignedUserName: string;
    AssignedUserDepartmentId: number;
    AssignedDate: Date;
    AttendUserId: number;
    AttendUserName: string;
    CalledTime: Date;
    AttendTime: Date;
    AttendingRoomId: number;
    AttendingRoomName: string;
    TrackerStatusId: number;
    TrackerComments: string;
    TrackerNotes: string;
    FollowupAppointmentOn: Date;
    IncludeReviewNotes: boolean;
    LagInMins: number;
    ClinicalStatusId: number;
    Duration: number;
    DurationPeriodId: number;
    ConsultationId: number;
    IsDischargeMedication: boolean;
    IsSMSNotified: boolean;
    FollowupComments1: string;
    FollowupBy1: string;
    FollowupDate1: Date;
    FollowupComments2: string;
    FollowupBy2: string;
    FollowupDate2: Date;
    FollowupComments3: string;
    FollowupBy3: string;
    FollowupDate3: Date;
    FollowupTrackerStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientTrackerInstance extends Instance<PatientTrackerAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientTrackerAttributes;
}
