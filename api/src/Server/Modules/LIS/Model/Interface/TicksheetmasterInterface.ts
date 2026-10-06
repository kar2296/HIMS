import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface TicksheetmasterAttributes extends IAttributes {
    Id: number;
    Ticksheetname: string;
    Displayorder: number;
    DepartmentId: number;
    SubDepartmentId: number;
    TicksheetTypeId: number;
    TestmasterId: number;
    TestName: string;
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

export interface TicksheetmasterInstance extends Instance<TicksheetmasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: TicksheetmasterAttributes;
}
