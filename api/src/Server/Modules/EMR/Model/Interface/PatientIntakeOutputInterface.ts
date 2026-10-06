import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface PatientIntakeOutputAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    IntakeOutputTime: Date;
    IntakeOutputTypeId: number;
    IntakeTypeId: number;
    IntakeVolume: number;
    OutputTypeId: number;
    OutputVolume: number;
    Signatory: string;
    CapturedBy: number;
    EncounterId: number;
    Comments: string;
    Status: number;
    IntakeOutputStatusId: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientIntakeOutputInstance extends Instance<PatientIntakeOutputAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientIntakeOutputAttributes;
}
