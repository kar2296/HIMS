import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface DrugFrequencyAttributes extends IAttributes {
    Id: number;
    DrugFrequencyTypeId: number;
    Code: string;
    Name: string;
    Description: string;
    NoOfTimes: number;
    DrugFrequencySIGCodeId: number;
    StartDuration: string;
    FacilityId: number;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface DrugFrequencyInstance extends Instance<DrugFrequencyAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: DrugFrequencyAttributes;
}
