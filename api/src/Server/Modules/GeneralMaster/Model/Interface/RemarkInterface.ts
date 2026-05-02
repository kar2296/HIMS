import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface RemarkAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    RemarkTypeId: number;
    ScreenId: number;
    Code: string;
    Remarks: string;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface RemarkInstance extends Instance<RemarkAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: RemarkAttributes;
}
