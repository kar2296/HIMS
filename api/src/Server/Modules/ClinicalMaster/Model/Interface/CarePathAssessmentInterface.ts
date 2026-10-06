import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface CarePathAssessmentAttributes extends IAttributes {
    Id: number;
    CarePathId: number;
    AssessmentId: number;
    AssessmentTypeId: number;
    IsManditory: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface CarePathAssessmentInstance extends Instance<CarePathAssessmentAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: CarePathAssessmentAttributes;
}
