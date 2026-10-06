import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface GroupAttributes extends IAttributes {
    Id: number;
    GroupCode: string;
    GroupName: string;
    Description: string;
    IsActive: boolean;
    ActiveStatusId: number;
    IsAllFacility: boolean;
    FacilityId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface GroupInstance extends Instance<GroupAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: GroupAttributes;
}
