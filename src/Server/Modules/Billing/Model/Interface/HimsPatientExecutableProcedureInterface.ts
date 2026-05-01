import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface PatientExecutableProcedureAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    BillsRaisedFromId: number;
    PatientBillId: number;
    BillNumber: string;
    BillDateTime: Date;
    PatientBillDetailId: number;
    PatientOrderId: number;
    PatientOrderDetailId: number;
    OrderNumber: string;
    OrderRequestDate: Date;
    EncounterId: number;
    DoctorId: number;
    PatientId: number;
    ServiceId: number;
    ServiceName: string;
    ServiceCategoryId: number;
    TestId: number;
    TestCode: string;
    TestName: string;
    OrderStatusId: number;
    DepartmentId: number;
    PatientBillStatusId: number;
    Quantity: number;
    Rate: number;
    Amount: number;
    DiscountPercentage: number;
    DiscountAmount: number;
    NetAmount: number;
    ReceivedAmount: number;
    DoctorShare: number;
    BodySiteId: number;
    AssignTypeId: number;
    ExecutedBy: number;
    ExecutedAt: Date;
    Comments: string;
    ExecutableProcedureStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientExecutableProcedureInstance extends Instance<PatientExecutableProcedureAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientExecutableProcedureAttributes;
}
