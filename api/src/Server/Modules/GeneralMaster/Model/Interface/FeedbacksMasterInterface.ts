import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface FeedbacksMasterAttributes extends IAttributes {
    Id: number;
    FeedbackTypeId: number;
    FeedbackCategoryId: number;
    Feedbacks: String;
    Description: String;
    IsActive: boolean;
    FacilityId: number;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface FeedbacksMasterInstance extends Instance<FeedbacksMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: FeedbacksMasterAttributes;
}
