import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface CityMasterAttributes extends IAttributes {
    Id: number;
    CityName: string;
    CityCode: string;
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

export interface CityMasterInstance extends Instance<CityMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: CityMasterAttributes;
}
