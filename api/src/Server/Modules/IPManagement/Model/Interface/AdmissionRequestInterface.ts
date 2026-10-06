import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface AdmissionRequestAttributes extends IAttributes {
    Id: number;
    RequestIdentifier: string;
    RequestDate: Date;
    FacilityId: number;
    OrganizationId: number;
    PatientId: number;
    EncounterId: number;
    DoctorId: number;
    DepartmentId: number;
    AdvisedDateTime: Date;
    AdvisedDoctorId: number;
    AdvisedDepartmentId: number;
    DiagnosisId: number;
    AdmissionReasonId: number;
    OtherReasons: string;
    AdmissionRequestTypeId: number;
    OtherType: string;
    SurgProceduresNotes: string;
    BloodReqId: number;
    BloodReqNotes: string;
    ExpectedStayDuration: string;
    ExpectedCost: string;
    PayerId: number;
    OtherPayers: string;
    OtherInstruction: string;
    NurseInstruction: string;
    Comments: string;
    AdmissionRequestStatusId: number;
    PriorityId: number;
    AdmissionDate: Date;
    ExceptedDisDate: Date;
    ALOS: number;
    LocationId: number;
    WardId: number;
    RoomId: number;
    BedId: number;
    ServiceRateCategoryId: number;
    Attachment: string;
    Remarks: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;

}

export interface AdmissionRequestInstance extends Instance<AdmissionRequestAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AdmissionRequestAttributes;
}
