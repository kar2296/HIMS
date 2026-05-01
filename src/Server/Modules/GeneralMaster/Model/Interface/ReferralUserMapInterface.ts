import {IAudit} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface ReferralUserMapAttributes extends IAudit {
    ReferralId: number;
    UserId: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ReferralUserMapInstance extends Instance<ReferralUserMapAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ReferralUserMapAttributes;
}
