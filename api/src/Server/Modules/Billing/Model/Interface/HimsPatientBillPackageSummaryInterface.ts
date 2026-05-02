import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientBillPackageSummaryAttributes extends IAttributes {
    Id: number;
    EncounterId: number;
    IPPackageId: number;
    EncounterIPPackageId: number;
    PackageName: string;
    ServiceGroupId: number;
    ServiceCategoryId: number;
    ServiceSubCategoryId: number;
    ActualAmount: number;
    ActualPatAmount: number;
    PackageAmount: number;
    InclusionAmount: number;
    ExclusionAmount: number;
    DisplayOrder: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientBillPackageSummaryInstance extends Instance<PatientBillPackageSummaryAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientBillPackageSummaryAttributes;
}
