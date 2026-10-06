import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ProductTypeAttributes extends IAttributes {
    Id: number;
    ProductTypeCode: string;
    ProductTypeName: string;
    ProductTypeDescription: string;
    CategoryId: number;
    SubCategoryId: number;
    SubTypeId: number;
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

export interface ProductTypeInstance extends Instance<ProductTypeAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ProductTypeAttributes;
}
