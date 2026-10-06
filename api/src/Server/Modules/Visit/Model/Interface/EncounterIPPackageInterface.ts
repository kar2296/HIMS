import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface EncounterIPPackageAttributes extends IAttributes {
    Id: number;
    EncounterId: number;
    PatientId: number;
    IPPackageId: number;
    IPPackageCode: string;
    IPPackageShortCode: string;
    IPPackageName: string;
    IPPackageDescription: string;
    PackageAssignedDate: Date;
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
}

export interface EncounterIPPackageInstance extends Instance<EncounterIPPackageAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: EncounterIPPackageAttributes;
}
