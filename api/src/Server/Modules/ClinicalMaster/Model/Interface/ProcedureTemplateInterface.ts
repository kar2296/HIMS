import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface ProcedureTemplateAttributes extends IAttributes {
    Id: number;
    ProcedureId: number;
    ProcedureTemplateTypeId: number;
    ProcedureTemplateGroupId: number;
    ProcedureTemplateCategoryId: number;
    DisplayOrder: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ProcedureTemplateInstance extends Instance<ProcedureTemplateAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ProcedureTemplateAttributes;
}
