import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientRefundDetailsAttributes extends IAttributes {
    Id: number;
    RefundDetailsDateTime: Date;
    PatientRefundId: number;
    FacilityId: number;
    OrganizationId: number;
    PatientId: number;
    EncounterId: number;
    // EncounerTypeId: number;
    RefundAmount: number;
    EncounterTypeId: number;
    DepartmentID: number;
    StoreMasterId: number;
    PaymentCounterId: number;
    DoctorId: number;
    DoctorName: string;
    ServiceId: number;
    ServiceName: string;
    ReturnQuantity: number;
    BatchId: string;
    ExpiryDate: Date;
    Rate: number;
    GrossAmount: number;
    GrossGSTAmount: number;
    DiscountAmount: number;
    DoctorDiscountAmount: number;
    GSTId: number;
    GSTAmount: number;
    EducationCess: number;
    NetAmount: number;
    PatientBillId: number;
    PharmacyReturnId: number;
    Comments: string;
    RoundOffValue: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientRefundDetailsInstance extends Instance<PatientRefundDetailsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientRefundDetailsAttributes;
}
