import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface StateMasterAttributes extends IAttributes {
    Id: number;
    StateName: string;
    StateCode: string;
    CountryId: number;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface StateMasterInstance extends Instance<StateMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: StateMasterAttributes;
}
