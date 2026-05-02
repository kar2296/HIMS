import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface OccupationAttributes extends IAttributes {
    Id: number;
    OccupationTypeId: number;
    ShortCode: string;
    Code: string;
    Occupations: string;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface OccupationInstance extends Instance<OccupationAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: OccupationAttributes;
}
