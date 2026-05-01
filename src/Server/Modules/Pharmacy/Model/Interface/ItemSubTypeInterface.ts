import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ItemSubTypeAttributes extends IAttributes {
    Id: number;
    SubTypeCode: string;
    SubTypeName: string;
    SubTypeDescription: string;
    CategoryId: number;
    SubCategoryId: number;
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

export interface ItemSubTypeInstance extends Instance<ItemSubTypeAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ItemSubTypeAttributes;
}
