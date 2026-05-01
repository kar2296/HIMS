import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface DosageLimitAttributes extends IAttributes {
    Id: number;
    DrugId: number;
    GenderId: number;
    DrugAgeGroupId: number;
    UpperLimit: string;
    LowerLimit: string;
    MaximumDosagePerDay: string;
    BodyWeight: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface DosageLimitInstance extends Instance<DosageLimitAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: DosageLimitAttributes;
}
