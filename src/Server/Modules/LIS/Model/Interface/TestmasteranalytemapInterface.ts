import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface TestmasteranalytemapAttributes extends IAttributes {
    Id: number;
    TestmasterId: number;
    TestmasterMapId: number;
    AnalyteId: number;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    DisplayOrder:number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface TestmasteranalytemapInstance extends Instance<TestmasteranalytemapAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: TestmasteranalytemapAttributes;
}
