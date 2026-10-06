import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PreOperativeChecklistAttributes extends IAttributes {
    Id: number;
    EncounterId: number;
    PatientId: number;
    FacilityId: number;
    EncounterTypeId: number;
    CheckListTypeId: number;
    CheckListOn: Date;
    WardId: number;
    RoomId: number;
    BedId: number;
    ReviewedBy: number;
    ReviewedOn: Date;
    PatientSignature: string;
    PreOperativeChecklistStatusId: number;
    SignPath:string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PreOperativeChecklistInstance extends Instance<PreOperativeChecklistAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PreOperativeChecklistAttributes;
}
