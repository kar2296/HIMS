import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface DefaultNotesAttributes extends IAttributes {
    Id: number;
    DefaultNoteTypeId: number;
    FacilityId: number;
    Code: string;
    DataTemplate: string;
    Notes: string;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface DefaultNotesInstance extends Instance<DefaultNotesAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: DefaultNotesAttributes;
}
