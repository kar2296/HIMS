import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface AppointmentSessionAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    AppointmentSessionTypeId: number;
    SessionTypeId: number;
    ClinicId: number;
    SpecialityId: number;
    DoctorId: number;
    ResourceId: number;
    IsOrderMandatory: boolean;
    IsAllowForceBooking: boolean;
    StartDate: Date;
    EndDate: Date;
    IsMonday: boolean;
    IsTuesday: boolean;
    IsWednesday: boolean;
    IsThursday: boolean;
    IsFriday: boolean;
    IsSaturday: boolean;
    IsSunday: boolean;
    IsAll: boolean;
    AppointmentSlotTypeId: number;
    SlotDuration: string;
    StartTime: string;
    EndTime: string;
    BreakFrom: string;
    BreakTo: string;
    MaxSlotPerDay: number;
    NoofScheduleAppt: number;
    NoofWalkInPatient: number;
    HolidayFrom: Date;
    HolidayTo: Date;
    ActiveStatusId: number;
    IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface AppointmentSessionInstance extends Instance<AppointmentSessionAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AppointmentSessionAttributes;
}
