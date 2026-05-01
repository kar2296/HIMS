import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface ProductSubTypeAttributes extends IAttributes {
    Id: number;
    SubProductTypeCode: string;
    SubProductTypeName: string;
    ProductSubType: number;
    SubProductTypeDescription: string;
    CategoryId: number;
    SubCategoryId: number;
    ProductTypeId: number;
    FacilityId: number;
    IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ProductSubTypeInstance extends Instance<ProductSubTypeAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ProductSubTypeAttributes;
}
