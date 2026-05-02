import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientLaserAdviceAttributes extends IAttributes {
    Id: number;
    LaserGroupingId:number;
    PatientId: number;
    EncounterId: number;
    ConsultationId: number;
    LaserNameId: number;
    LaserName: string;
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

export interface PatientLaserAdviceInstance extends Instance<PatientLaserAdviceAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientLaserAdviceAttributes;
}
