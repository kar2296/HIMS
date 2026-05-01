import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface BannerContentAttributes extends IAttributes {
    Id: number;
    OrganizationId: number;
    FacilityId: number;
    CategoryId: number;
    Attachment: string;
    BannerContent: string;
    Content: string;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface BannerContentInstance extends Instance<BannerContentAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: BannerContentAttributes;
}
