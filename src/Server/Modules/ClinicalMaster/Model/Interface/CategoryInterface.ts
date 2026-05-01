import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface CategoryAttributes extends IAttributes {
    Id: number;
    CategoryName: string;
    CategoryTypeId: number;
    CategoryType : string;
    CategoryIdentifier: string;
    CategoryGroupId: number;
    Description: string;
    ActiveStatusId: number;
    IsActive: boolean;
    IsPrint: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface CategoryInstance extends Instance<CategoryAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: CategoryAttributes;
}
