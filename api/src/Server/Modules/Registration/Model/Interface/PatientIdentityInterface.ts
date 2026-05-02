import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface PatientIdentityAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    PatientIdentityTypeId: number;
    IDNumber: string;
    Comments: string;
    StatusId: boolean;
    Status: number;
    ImagePath: string;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientIdentityInstance extends Instance<PatientIdentityAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientIdentityAttributes;
}
