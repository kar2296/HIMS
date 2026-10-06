import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PMRDetailAttributes extends IAttributes {
    Id: number;
    PMRId: number;
    ItemMasterId: number;
    ItemCode: string;
    ItemName: string;
    CategoryId: number;
    SubCategoryId: number;
    ProductTypeId: string;
    SubProductTypeId: number;
    Quantity: string;
    IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PMRDetailInstance extends Instance<PMRDetailAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PMRDetailAttributes;
}
