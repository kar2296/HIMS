import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface DrawsiteAttributes extends IAttributes {
    Id: number;
    Name: string;
    Description: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    Reason: string;
}

export interface DrawsiteInstance extends Instance<DrawsiteAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: DrawsiteAttributes;
}
