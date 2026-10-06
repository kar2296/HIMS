import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface GuarantorSupplementaryAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    SupplementaryTypeId: number;
    GuarantorId: number;
    ServiceItemId: number;
    ServiceCategoryId: number;
    ItemMasterId: number;
    ItemCategoryId: number;
    Quantity: number;
    PrintOrder: number;
    GuarantorSupplementaryStatus: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface GuarantorSupplementaryInstance extends Instance<GuarantorSupplementaryAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: GuarantorSupplementaryAttributes;
}
