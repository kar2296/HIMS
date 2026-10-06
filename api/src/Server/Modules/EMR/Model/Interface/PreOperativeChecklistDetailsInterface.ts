import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PreOperativeChecklistDetailsAttributes extends IAttributes {
    Id: number;
    PreOperativeChecklistId: number;
    FeedbackMasterId: number;
    CheckListMasterId: number;
    CheckListTypeId: number;
    CheckListCategoryId: number;
    Description: string;
    RatingId: number;
    PreOperativeChecklistStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PreOperativeChecklistDetailsInstance extends Instance<PreOperativeChecklistDetailsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PreOperativeChecklistDetailsAttributes;
}
