import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface StorePreferenceAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    StoreMasterId: number;
    Category: string;
    Section: string;
    PreferenceDisplay: string;
    PreferenceKey: string;
    PreferenceValue: string;
    PreferenceType: string;
    DisplayOrder: number;
    Row: number;
    Col: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface StorePreferenceInstance extends Instance<StorePreferenceAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: StorePreferenceAttributes;
}
