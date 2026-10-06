import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface DailyNoteAttributes extends IAttributes {
    Id: number;
    OrganizationId: number;
    FacilityId: number;
    NoteStatusId: number;
    NoteTypeId: number;
    PatientId: number;
    LinkedPatientId:number;
    EncounterId: number;
    CapturedBy: number;
    CapturedOn: Date;
    DailyNote: string;
    SpecialNote: string;
    DailyNoteStatusId: number;
    EncounterTypeId:number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface DailyNoteInstance extends Instance<DailyNoteAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: DailyNoteAttributes;
}
