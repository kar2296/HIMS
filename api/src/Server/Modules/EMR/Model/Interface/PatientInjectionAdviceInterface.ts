import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientInjectionAdviceAttributes extends IAttributes {
    Id: number;
    InjectionGroupingId:number;
    PatientId: number;
    EncounterId: number;
    ConsultationId: number;
    InjectionNameId: number;
    InjectionName: string;
    SideId: number;
    AppointmentDate: Date;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientInjectionAdviceInstance extends Instance<PatientInjectionAdviceAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientInjectionAdviceAttributes;
}
