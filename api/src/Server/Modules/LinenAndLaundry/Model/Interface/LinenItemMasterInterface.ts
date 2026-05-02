import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface LinenItemMasterAttributes extends IAttributes {
    Id: number;
    Code: string;
    Name: string;
    Description: string;
    FacilityId: number;
    LinenTypeId: number;
    LinenCategoryId: number;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface LinenItemMasterInstance extends Instance<LinenItemMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: LinenItemMasterAttributes;
}
