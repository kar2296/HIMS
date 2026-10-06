import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientDietOrderAttributes extends IAttributes {
    Id: number;
    EncounterId: number;
    PatientId: number;
    // EncounterTypeId: number;
    OrderTypeId: number;
    RoomId: number;
    BedId: number;
    EncounterConsultationId: number;
    WardId: number;
    ServiceRateCategoryId: number;
    OrderNumber: string;
    OrderRequestDate: Date;
    OrderScheduleDate: Date;
    DoctorId: number;
    DoctorName: string;
    OrderFromId: number;
    OrderToId: number;
    OrderStatusId: number;
    OrderCompletedDate: Date;
    OrderPriorityId: number;
    OrderToLocation: number;
    OrderLocationId: number;
    DietFrequencyId : number;
    ScheduledDate: Date;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientDietOrderInstance extends Instance<PatientDietOrderAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientDietOrderAttributes;
}
