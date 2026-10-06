import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface ChiefComplaintAttributes extends IAttributes {
    Id: number;
    Code: string;
    ChiefComplaint: string;
    ChiefComplaintCategoryId: number;
    Description: string;
    ReferrenceLink: string;
    BodySite: string;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ChiefComplaintInstance extends Instance<ChiefComplaintAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ChiefComplaintAttributes;
}
