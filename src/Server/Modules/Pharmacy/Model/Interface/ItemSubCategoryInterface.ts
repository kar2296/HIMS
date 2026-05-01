import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ItemSubCategoryAttributes extends IAttributes {
    Id: number;
    SubCategoryCode: string;
    SubCategoryName: string;
    SubCategoryDescription: string;
    CategoryId: number;
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

export interface ItemSubCategoryInstance extends Instance<ItemSubCategoryAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ItemSubCategoryAttributes;
}
