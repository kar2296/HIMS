import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientSurgeryAdviceAttributes extends IAttributes {
    Id: number;
    SurgeryGroupingId:number;
    PatientId: number;
    EncounterId: number;
    ConsultationId: number;
    SurgeryNameId: number;
    SurgeryName: string;
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

export interface PatientSurgeryAdviceInstance extends Instance<PatientSurgeryAdviceAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientSurgeryAdviceAttributes;
}
