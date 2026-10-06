import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface AppointmentAttributes extends IAttributes {
    Id: number;
    AppointmentTypeId: number;
    AppointmentStatusId: number;
    AppointmentDate: Date;
    AppointmentCategoryId: number;
    PatientId: number;
    FacilityId: number;
    DepartmentId: number;
    DoctorId: number;
    ResourceId: number;
    ResearchProjectId: number;
    IsForceBooking: boolean;
    StartTime: string;
    EndTime: string;
    CancelorRescheduleComments: string;
    ReferralId: number;
    PriorityId: number;
    RemarkId: number;
    Comments: string;
    VisitTypeId: number;
    ReferralTypeId: number;
    CancelledRemarks: string;
    IsAssignedToUser: boolean;
    IsAssignedToGroup: boolean;
    IsMRDFile: boolean;
    AssignedUserId: number;
    AssignedGroupId: number;
    PatientGuarantorId: number;
    AssignedUserName: string;
    ReferralName: string;
    Remarks: string;
    IsMrdFileRequest: boolean;
    IsEmergency: boolean;
    IsVirtualAppointments: boolean;
    SubCategoryId: number;
    VirtualOrderId: number;
    OrderConsultTypeId: number;
    IsPaid: boolean;
    IsRescheduled: boolean;
    PaymentGatewayRefNo: string;
    PaymentModeId: number;
    Amount: number;
    PaymentStatusId: number;
    BankName: string;
    ApprovalNumber: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface AppointmentInstance extends Instance<AppointmentAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AppointmentAttributes;
}
