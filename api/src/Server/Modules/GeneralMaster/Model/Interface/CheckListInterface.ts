import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface CheckListAttributes extends IAttributes {
    Id: number;
    CheckListTypeId: number;
    CheckListCategoryId: number;
    CheckLists: String;
    Description: String;
    IsActive: boolean;
    FacilityId: number;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface CheckListInstance extends Instance<CheckListAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: CheckListAttributes;
}
