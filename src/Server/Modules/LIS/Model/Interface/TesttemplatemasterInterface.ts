import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface TesttemplatemasterAttributes extends IAttributes {
    Id: number;
    IdentifyingId: number;
    Identifyingtype: string;
    Code: string;
    Name: string;
    isAutoLoad: number;
    templatedata: string;
    Activefrom: Date;
    Activeto: Date;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface TesttemplatemasterInstance extends Instance<TesttemplatemasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: TesttemplatemasterAttributes;
}
