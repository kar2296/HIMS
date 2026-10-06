import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface FrequencyCategoryAttributes extends IAttributes {
    Id: number;
    FrequencyId: number;
    ClinicalFrequencyCategoryId: number;
    ActiveFrom: Date;
    ActiveTo: Date;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface FrequencyCategoryInstance extends Instance<FrequencyCategoryAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: FrequencyCategoryAttributes;
}
