import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface SectionMasterAttributes extends IAttributes {
    Id: number;
    ParentSectionId: number;
    SectionTypeId: number;
    SectionNoteTypeId: string;
    Name: string;
    Description: string;
    SectionNoteTypeName: string;
    SRef: string;
    DockPositionId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface SectionMasterInstance extends Instance<SectionMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: SectionMasterAttributes;
}
