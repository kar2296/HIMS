import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface OtNotesAttributes extends IAttributes {
    Id: number;
    TemplateTypeId: number;
    OtNoteTypeId: number;
    PatientId: number;
    OTRegisterId: number;
    EncounterId: number;
    DataTemplate: string;
    IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    ActiveStatusId: number;

}

export interface OtNotesInstance extends Instance<OtNotesAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: OtNotesAttributes;
}
