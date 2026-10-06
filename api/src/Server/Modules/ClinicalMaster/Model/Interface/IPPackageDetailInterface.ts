import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface IPPackageDetailAttributes extends IAttributes {
    Id: number;
    IPPackageId: number;
    IPPackageTariffDetailId: number;
    ServiceCategoryId: number;
    ServiceCategoryCode: string;
    ServiceCategoryName: string;
    ActualAmount: number;
    PackageAmount: number;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface IPPackageDetailInstance extends Instance<IPPackageDetailAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: IPPackageDetailAttributes;
}
