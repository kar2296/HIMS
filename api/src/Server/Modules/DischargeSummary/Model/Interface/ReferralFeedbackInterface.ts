import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ReferralFeedbackAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    EncounterId: number;
    PatientName: string;
    TemplateTypeId: number;
    NoteTemplateId: string;
    ReferralId: number;
    ReferralDate: Date;
    SourceId: number;
    VisitNo: string;
    DataTemplate: string;
    PhoneNo: string;
    Address: string;
    ReferralDoctor: string;
    ReferralStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ReferralFeedbackInstance extends Instance<ReferralFeedbackAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ReferralFeedbackAttributes;
}
