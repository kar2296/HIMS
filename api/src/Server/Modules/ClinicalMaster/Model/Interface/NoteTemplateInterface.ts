import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface NoteTemplateAttributes extends IAttributes {
    Id: number;
    NoteTypeId: number;
    DepartmentId: number;
    SubDepartmentId: number;
    FacilityId: number;
    Code: string;
    TemplateName: string;
    DataTemplate: string;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface NoteTemplateInstance extends Instance<NoteTemplateAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: NoteTemplateAttributes;
}
