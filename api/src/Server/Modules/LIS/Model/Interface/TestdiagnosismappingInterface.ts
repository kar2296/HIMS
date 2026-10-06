import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface TestdiagnosismappingAttributes extends IAttributes {
    Id: number;
    TestMasterId: number;
    DiagnosisCodeTypeId: number;
    DiagnosisCodeSchemeId: number;
    DiagnosisId: number;
    DiagnosisName: string;
    Comments: string;
    ActiveFrom: Date;
    ActiveTo: Date;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface TestdiagnosismappingInstance extends Instance<TestdiagnosismappingAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: TestdiagnosismappingAttributes;
}
