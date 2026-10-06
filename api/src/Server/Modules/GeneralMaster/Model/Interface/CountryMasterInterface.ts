import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface CountryMasterAttributes extends IAttributes {
    Id: number;
    CountryName: string;
    CountryCode: string;
    ActiveStatusId: number;
    Status: number;
    IsActive: boolean;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface CountryMasterInstance extends Instance<CountryMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: CountryMasterAttributes;
}
