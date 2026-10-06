import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface SuccessStoryAttributes extends IAttributes {
    Id: number;
    OrganizationId: number;
    FacilityId: number;
    CategoryId: number;
    SuccessStoryDate: Date;
    Title: string;
    Attachment: string;
    SuccessStory: string;
    Content: string;
    IsActive: boolean;
    ActiveStatusId: number;
    CreatedId: number;
    CreatedDate: Date;
    UpdatedId: number;
    UpdatedDate: Date;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface SuccessStoryInstance extends Instance<SuccessStoryAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: SuccessStoryAttributes;
}
