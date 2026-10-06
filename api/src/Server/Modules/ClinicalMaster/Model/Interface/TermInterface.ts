import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface TermAttributes extends IAttributes {
    Id: number;
    ConceptId: number;
    TermName: string;
    Code: string;
    DisplayOrder: number;
    IsDefault: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface TermInstance extends Instance<TermAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: TermAttributes;
}
