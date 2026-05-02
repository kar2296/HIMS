import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface CollectionBaseRevenueAttributes extends IAttributes {
    Id: number;
    PatientBillId: number;
    PatientBillDetailId: number;
    EncounterId: number;
    EncounterTypeId: number;
    PatientId: number;
    DoctorId: number;
    DepartmentId: number;
    ServiceItemId: number;
    CategoryId: number;
    ReferralId: number;
    GuarantorId: number;
    FacilityId: number;
    GuarantorName: string;
    VisitIdentifier: string;
    BillDateTime: Date;
    BillNumber: string;
    PatientName: string;
    SwosthaID: string;
    DoctorName: string;
    TestDepartmentName: string;
    ServiceName: string;
    ServiceCategoryName: string;
    BillAmount: number;
    BillDiscount: number;
    BillNetAmount: number;
    GrossDoctorShare: number;
    TDSAmount: number;
    NetDoctorShare: number;
    ProviderShare: number;
    ReferralName: string;
    BillGeneratedName: string;
    BillGeneratedBy: number;
    PatientBillStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface CollectionBaseRevenueInstance extends Instance<CollectionBaseRevenueAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: CollectionBaseRevenueAttributes;
}
