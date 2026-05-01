import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface CategoryTypeMasterAttributes extends IAttributes {
    Id: number;
    Name: string;
    Description: string;
    CategoryTypeRefId: number;
    IsAssociatedWithCC: boolean;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface CategoryTypeMasterInstance extends Instance<CategoryTypeMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: CategoryTypeMasterAttributes;
}
