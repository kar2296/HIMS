import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface TestmasterfacilitymapAttributes extends IAttributes {
    TestmasterId: number;
    FacilityId: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface TestmasterfacilitymapInstance extends Instance<TestmasterfacilitymapAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: TestmasterfacilitymapAttributes;
}
