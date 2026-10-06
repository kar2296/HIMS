import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface AssessmentAttributes extends IAttributes {
    Id: number;
    AssessmentTypeId: number;
    Code: string;
    DepartmentId: number;
    SectionId: number;
    ActiveStatusId: number;
    AssessmentName: string;
    SpecialInstruction: string;
    IsActive: boolean;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface AssessmentInstance extends Instance<AssessmentAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AssessmentAttributes;
}
