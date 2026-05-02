import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PreferencesAttributes extends IAttributes {
    Id: number;
    Name: string;
    Description: string;
    TypeId: number;
    ActiveStatusId: number;
    IsActive: boolean;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PreferencesInstance extends Instance<PreferencesAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PreferencesAttributes;
}
