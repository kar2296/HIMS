import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface FacilityPreferenceMasterAttributes extends IAttributes {
    Id: number;
    Category: string;
    Section: string;
    PreferenceDisplay: string;
    PreferenceKey: string;
    PreferenceDefaultValue: string;
    PreferenceType : string;
    Row: number;
    Col: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface FacilityPreferenceMasterInstance extends Instance<FacilityPreferenceMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: FacilityPreferenceMasterAttributes;
}
