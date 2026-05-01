import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface TeamAttributes extends IAttributes {
    Id: number;
    TeamName: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface TeamInstance extends Instance<TeamAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: TeamAttributes;
}
