import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface IPPackageTariffDetailAttributes extends IAttributes {
    Id: number;
    IPPackageId: number;
    WardId: number;
    TariffTypeId: number;
    GuarantorTypeId: number;
    GuarantorId: number;
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

export interface IPPackageTariffDetailInstance extends Instance<IPPackageTariffDetailAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: IPPackageTariffDetailAttributes;
}
