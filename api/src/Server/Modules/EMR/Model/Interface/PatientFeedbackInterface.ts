import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientFeedbackAttributes extends IAttributes {
    Id: number;
    EncounterId: number;
    PatientId: number;
    FacilityId: number;
    EncounterTypeId: number;
    FeedbackTypeId: number;
    FeedbackOn: Date;
    WardId: number;
    RoomId: number;
    BedId: number;
    ReviewedBy: number;
    ReviewedOn: Date;
    PatientSignature: string;
    PatientFeedbackStatusId: number;
    SignPath: string;
    Remarks: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientFeedbackInstance extends Instance<PatientFeedbackAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientFeedbackAttributes;
}
