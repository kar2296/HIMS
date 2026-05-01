import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface FacilitySettingAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    MinLoginNameLength: number;
    MaxLoginNameLength: number;
    ReqNoOfLoginDigit: number;
    MinPwdLength: number;
    MaxPwdLength: number;
    IsSpecialCharacterAllowedinPwd: boolean;
    DefaultPwd: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface FacilitySettingInstance extends Instance<FacilitySettingAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: FacilitySettingAttributes;
}
