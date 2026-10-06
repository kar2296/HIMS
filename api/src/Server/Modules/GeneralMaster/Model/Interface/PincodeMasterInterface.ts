import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface PincodeMasterAttributes extends IAttributes {
    Id: number;
    Pincode: string;
    Area: string;
    CityId: number;
    DistrictId: number;
    StateId: number;
    CountryId: number;
	  ActiveStatusId: number;
    IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PincodeMasterInstance extends Instance<PincodeMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PincodeMasterAttributes;
}
