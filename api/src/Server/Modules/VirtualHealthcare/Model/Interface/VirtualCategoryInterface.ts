import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface VirtualCategoryAttributes extends IAttributes {
    Id: number;
    CategoryCode: string;
    CategoryName: string;
    CategoryDescription: string;
    FacilityId: number;
    DepartmentId: number;
    ActiveStatusId: number;
    ConsultancyTypeId: number;
    Imagepath: string;
    IsActive: boolean;
    IsLabCategory: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface VirtualCategoryInstance extends Instance<VirtualCategoryAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: VirtualCategoryAttributes;
}
