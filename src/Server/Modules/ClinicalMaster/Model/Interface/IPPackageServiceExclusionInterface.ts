import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface IPPackageServiceExclusionAttributes extends IAttributes {
    Id: number;
    IPPackageDetailId: number;
    ServiceCategoryId: number;
    ServiceItemId: number;
    ServiceItemName: string;
    Quantity: number;
    Rate: number;
    Amount: number;
    TotalAmount: number;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface IPPackageServiceExclusionInstance extends Instance<IPPackageServiceExclusionAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: IPPackageServiceExclusionAttributes;
}
