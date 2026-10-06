import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientFeedbackDetailsAttributes extends IAttributes {
    Id: number;
    PatientFeedbackId: number;
    FeedbackMasterId: number;
    FeedbackTypeId: number;
    FeedbackCategoryId: number;
    Description: string;
    RatingId: number;
    PatientFeedbackStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientFeedbackDetailsInstance extends Instance<PatientFeedbackDetailsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientFeedbackDetailsAttributes;
}
