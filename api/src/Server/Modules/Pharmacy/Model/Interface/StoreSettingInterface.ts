import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface StoreSettingAttributes extends IAttributes {
    Id: number;
    StoreMasterId: number;
    FacilityId: number;
	CanStockTransferTo: string;
    CanStockReturnTo: string;
	Register: boolean;
    Pick: boolean;
    Allocate: boolean;
    Dispense: boolean;
    AllocateANDDispense: boolean;
    Rev: number;
    Status: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface StoreSettingInstance extends Instance<StoreSettingAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: StoreSettingAttributes;
}
