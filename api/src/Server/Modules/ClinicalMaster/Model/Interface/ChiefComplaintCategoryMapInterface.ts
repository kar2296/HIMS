import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface ChiefComplaintCategoryMapAttributes extends IAttributes {
    Id: number;
    ChiefComplaintId: number;
    CategoryId: number;
    Status: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ChiefComplaintCategoryMapInstance extends Instance<ChiefComplaintCategoryMapAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ChiefComplaintCategoryMapAttributes;
}
