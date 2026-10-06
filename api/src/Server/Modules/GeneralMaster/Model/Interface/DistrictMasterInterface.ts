import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface DistrictMasterAttributes extends IAttributes {
    Id: number;
    DistrictName: string;
    DistrictCode: string;
    StateId: number;
    CountryId: number;
    DistrictId: number;
    ActiveStatusId: number;
    IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface DistrictMasterInstance extends Instance<DistrictMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: DistrictMasterAttributes;
}
