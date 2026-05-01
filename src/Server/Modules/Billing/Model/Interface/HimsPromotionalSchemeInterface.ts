import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PromotionalSchemeAttributes extends IAttributes {
    Id: number;
    GuarantorId: number;
    PromotionSchemeId: number;
    PromotionSchemeCode: string;
    PromotionSchemeName: string;
    PromotionSchemeTypeId: number;
    DiscountModeId: number;
    Discount: number;
    ActiveStatusId: number;
    IsActive: boolean;
    ActiveFrom: Date;
    ActiveTo: Date;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PromotionalSchemeInstance extends Instance<PromotionalSchemeAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PromotionalSchemeAttributes;
}
