import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface FrequencyMasterAttributes extends IAttributes {
    Id: number;
    FrequencyTypeId: number;
    Code: string;
    Name: string;
    Description: string;
    NoOfTimes: number;
    FrequencySIGCodeId: number;
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

export interface FrequencyMasterInstance extends Instance<FrequencyMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: FrequencyMasterAttributes;
}
