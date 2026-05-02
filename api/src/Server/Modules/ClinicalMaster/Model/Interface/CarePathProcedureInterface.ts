import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface CarePathProcedureAttributes extends IAttributes {
    Id: number;
    CarePathId: number;
    ProcedureId: number;
    ProcedureCodeSchemeId: number;
    Code: string;
    IsManditory: boolean;
    ActiveStatusId: number;
    Quantity: number;
    Instruction: string;
    FrequencyId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface CarePathProcedureInstance extends Instance<CarePathProcedureAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: CarePathProcedureAttributes;
}
