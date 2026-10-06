import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface AnalyterefmasterAttributes extends IAttributes {
    Id: number;
    AnalyteId: number;
    GenderId: number;
    AnalyteRefTypeId: number;
    Agefrom: number;
    Ageto: number;
    Excludefrmprt: boolean;
    Refvalue: string;
    Maxvalue: string;
    Minvalue: string;
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

export interface AnalyterefmasterInstance extends Instance<AnalyterefmasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AnalyterefmasterAttributes;
}
