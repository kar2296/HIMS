import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface DrugFrequencyCategoryAttributes extends IAttributes {
    Id: number;
    DrugFrequencyId: number;
    FrequencyCategoryId: number;
    ActiveFrom: Date;
    ActiveTo: Date;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface DrugFrequencyCategoryInstance extends Instance<DrugFrequencyCategoryAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: DrugFrequencyCategoryAttributes;
}
