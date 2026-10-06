import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface AnalytealiasesmasterAttributes extends IAttributes {
    Id: number;
    AnalyteId: number;
    Name: string;
    Code: string;
    AliasesTypeId: number;
    Activestate: number;
    Activefrom: Date;
    Activeto: Date;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface AnalytealiasesmasterInstance extends Instance<AnalytealiasesmasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AnalytealiasesmasterAttributes;
}
