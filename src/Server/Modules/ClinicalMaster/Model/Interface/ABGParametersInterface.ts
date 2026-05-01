import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface ABGParametersAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    ABGParameters: string;
    Description: string;
    Mnemonic: string;
    LoincCode: string;
    ParameterTypeId: number;
    ItemServiceId: number;
    NormalFrom: string;
    NormalTo: string;
    LowFrom: string;
    LowTo: string;
    HighFrom: string;
    HighTo: string;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ABGParametersInstance extends Instance<ABGParametersAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ABGParametersAttributes;
}
