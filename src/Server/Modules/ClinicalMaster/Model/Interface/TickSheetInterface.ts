import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface TickSheetAttributes extends IAttributes {
    Id: number;
    TickSheetTypeId: number;
    DepartmentId: number;
    SubDepartmentId: number;
    TickSheetName: string;
    TickSheetMasterTypeId: number;
    TickSheetMasterTypeName: string;
    ItemId: number;
    ItemName: string;
    DisplayOrder: number;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface TickSheetInstance extends Instance<TickSheetAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: TickSheetAttributes;
}
