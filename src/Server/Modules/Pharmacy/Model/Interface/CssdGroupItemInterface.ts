import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface CssdGroupItemAttributes extends IAttributes {
    Id: number;
    CssdItemsetupId: number;
    ItemMasterId: number;
    GroupItemId: number;
    Quantity: number;
    WashingTypeId: number;
    PackingTypeId: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface CssdGroupItemInstance extends Instance<CssdGroupItemAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: CssdGroupItemAttributes;
}
