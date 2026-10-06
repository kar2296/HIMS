import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface DoctorShareTdsAttributes extends IAttributes {
    Id: number;
    PatientBillDetailId: number;
    EncounterId: number;
    EncounterTypeId: number;
    VisitIdentifier: string;
    BillDateTime: Date;
    BillNumber: string;
    PatientId: number;
    PatientName: string;
    SwosthaID: number;
    BillDoctorId: number;
    BillDoctorName: string;
    ShareDoctorId: number;
    ShareDoctorName: string;
    DepartmentId: number;
    TestDepartment: string;
    ServiceItemId: number;
    TestName: string;
    CategoryId: number;
    CategoryName: string;
    Amount: number;
    Discount: number;
    NetAmount: number;
    GrossDoctorShare: number;
    TDSAmount: number;
    NetDoctorShare: number;
    ProviderShare: number;
    ReferralId: number;
    ReferralName: string;
    GuarantorId: number;
    GuarantorName: string;
    BillGeneratedBy: number;
    BillGeneratedName: string;
    FacilityId: number;
    PatientBillStatusId: number;
    Status: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    PatientDoctorShareDetailId: number;
}

export interface DoctorShareTdsInstance extends Instance<DoctorShareTdsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: DoctorShareTdsAttributes;
}
