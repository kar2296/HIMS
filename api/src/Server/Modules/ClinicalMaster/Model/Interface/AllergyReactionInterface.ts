import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface AllergyReactionAttributes extends IAttributes {
    Id: number;
    DisplayId: string;
    AllergyReactionName: string;
    AllergyReactionTypeId: number;
    ReferrenceLink: string;
    Description: string;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface AllergyReactionInstance extends Instance<AllergyReactionAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AllergyReactionAttributes;
}
