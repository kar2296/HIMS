import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface ShoulderAssessmentAttributes extends IAttributes {
    Id: number;
    EncounterId: number;
    ConsultationId: number;
    PatientId: number;
    Content: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ShoulderAssessmentInstance extends Instance<ShoulderAssessmentAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ShoulderAssessmentAttributes;
}
