import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientBillSplitDetailsAttributes extends IAttributes {
    Id: number;
    PatientBillId: number;
    PatientBillDetailId: number;
    PatientBillSummaryId: number;
    VisitGuarantorId: number;
    BillDateTime: Date;
    DoctorId: number;
    DepartmentId: number;
    ServiceId: number;
    ServiceName: string;
    ItemAmount: number;
    ItemDiscount: number;
    FreeItemAmount: number;
    FreeItemDiscount: number;
    IsSplit: boolean;
    SplitGuarantorId: number;
    SplitItemAmount: number;
    SplitItemDiscount: number;
    FreeSplitItemAmount: number;
    FreeSplitItemDiscount: number;
    IsSupplementary: boolean;
    IsPackageItem: boolean;
    PackageId: number;
    PackageName: string;
    IsExclude: boolean;
    IsNightCharge: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    AliasId: string;
    AliasName: string;
}

export interface PatientBillSplitDetailsInstance extends Instance<PatientBillSplitDetailsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientBillSplitDetailsAttributes;
}
