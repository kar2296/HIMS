import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface PatientImmunizationScheduleAttributes extends IAttributes {
    Id: number;
    EncounterId: number;
    ConsultationId: number;
    PatientId: number;
    ScheduleId: number;
    ImmunizationId: number;
    ImmunizationName: string;
    ScheduleFlagId: number;
    RouteId: number;
    DosageId: number;
    Duration: number;
    PeriodId: number;
    IsActive: boolean;
    ActiveStatusId: number;
    ImmunizationDate: Date;
    AdministeredDate: Date;
    ImmunizationScheduleId: number;
    ImmunizationScheduleStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientImmunizationScheduleInstance extends Instance<PatientImmunizationScheduleAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientImmunizationScheduleAttributes;
}
