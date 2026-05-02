import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ItemCategoryAttributes extends IAttributes {
    Id: number;
    CategoryCode: string;
    CategoryName: string;
    CategoryDescription: string;
    FacilityId: number;
    IsAllFacility: boolean;
    IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ItemCategoryInstance extends Instance<ItemCategoryAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ItemCategoryAttributes;
}
