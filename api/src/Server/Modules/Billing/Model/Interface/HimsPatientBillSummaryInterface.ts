import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientBillSummaryAttributes extends IAttributes {
    Id: number;
    EncounterId: number;
    ServiceGroupId: number;
    ServiceCategoryId: number;
    ServiceSubCategoryId: number;
    ActualAmount: number;
    ActualNetAmount:number;
    ActualPatAmount: number;
    DiscountAmount: number;
    TaxAmount: number;
    FreeActualAmount: number;
    IsFreePatient: boolean;
    IsPharmacySale: boolean;
    DisplayOrder: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientBillSummaryInstance extends Instance<PatientBillSummaryAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientBillSummaryAttributes;
}
