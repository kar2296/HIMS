import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface VirtualSubCategoryAttributes extends IAttributes {
    Id: number;
    SubCategoryCode: string;
    SubCategoryName: string;
    SubCategoryDescription: string;
    CategoryId: number;
    ActiveStatusId: number;
    FacilityId: number;
    DepartmentId: number;
    Imagepath: string;
    IsActive: boolean;
    IsHome: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface VirtualSubCategoryInstance extends Instance<VirtualSubCategoryAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: VirtualSubCategoryAttributes;
}
