import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface IPPackageAttributes extends IAttributes {
    Id: number;
    IPPackageCode: string;
    IPPackageShortCode: string;
    IPPackageName: string;
    IPPackageDescription: string;
    IPPackageDays: number;
    OrganizationId: number;
    FacilityId: number;
    CategoryId: number;
    SubCategoryId: number;
    DepartmentId: number;
    SubDepartmentId: number;
    GuarantorTypeId: number;
    GuarantorId: number;
    ServiceRateCategoryId: number;
    IsRateEditable: boolean;
    IsActive: boolean;
    CreditAccount: string;
    DebitAccount: string;
    ActualAmount: number;
    PackageAmount: number;
    DiscountTypeId: number;
    DiscountModeId: number;
    DiscountValue: number;
    DiscountAmount: number;
    CreditAmount: string;
    DebitAmount: string;
    ActiveFrom: Date;
    ActiveTo: Date;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    IsUnlimitedServices: boolean;
    ICUDays: number;
}

export interface IPPackageInstance extends Instance<IPPackageAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: IPPackageAttributes;
}
