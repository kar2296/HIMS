import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ModifiedPatientBillCategorysAttributes extends IAttributes {
    Id: number;
    ModifiedPatientBillId: number;
    PatientBillId: number;
    EncounterId: number;
    EncounterIPPackageDetailId: number;
    ServiceGroupId: number;
    ServiceCategoryId: number;
    ServiceSubCategoryId: number;
    CategoryGrossAmount: number;
    CategoryDiscountAmount: number;
    CategoryGstAmount: number;
    CategoryNetAmount: number;
    GuarantorGrossAmount: number;
    SupplementaryGrossAmount: number;
    GuarantorDiscountAmount: number;
    SupplementaryDiscountAmount: number;
    GuarantorGstAmount: number;
    SupplementaryGstAmount: number;
    GuarantorNetAmount: number;
    SupplementaryNetAmount: number;
    ActualAmount: number;
    PackageAmount: number;
    DisplayOrder: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ModifiedPatientBillCategorysInstance extends Instance<ModifiedPatientBillCategorysAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ModifiedPatientBillCategorysAttributes;
}
