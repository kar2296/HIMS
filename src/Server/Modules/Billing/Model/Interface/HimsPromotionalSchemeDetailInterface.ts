import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PromotionalSchemeDetailAttributes extends IAttributes {
    Id: number;
    PromotionalSchemeId: number;
    ServiceCategoryId: number;
    ServiceCategoryCode: string;
    ServiceCategoryName: string;
    ServiceItemId: number;
    ServiceItemCode: string;
    ServiceItemName: string;
    DiscountModeId: number;
    Discount: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PromotionalSchemeDetailInstance extends Instance<PromotionalSchemeDetailAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PromotionalSchemeDetailAttributes;
}
