import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface ProcedureAliasAttributes extends IAttributes {
    Id: number;
    ProcedureId: number;
    Code: string;
    AliasName: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ProcedureAliasInstance extends Instance<ProcedureAliasAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ProcedureAliasAttributes;
}
