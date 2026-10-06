import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface TestmasterTemplateAttributes extends IAttributes {
    Id: number;
    TestmasterId: number;
    MaleDataTemplate: string;
    FemaleDataTemplate: string;
    IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    ActiveStatusId: number;
}

export interface TestmasterTemplateInstance extends Instance<TestmasterTemplateAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: TestmasterTemplateAttributes;
}
