import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface ItemWantedListAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    RequestedDate: Date;
    StoreMasterId: number;
    ItemMasterId: number;
    ItemCode: string;
    ItemName: string;
    RequestedBy: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ItemWantedListInstance extends Instance<ItemWantedListAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ItemWantedListAttributes;
}
