import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface SurgeryEntryDetailsAttributes extends IAttributes {
    Id: number;
    // SurgeryEntrydOn: Date;
    SurgeryEntryId: number;
    PatientId: number;
    // PatientName: string;
    // ScheduleTypeId: number;
    EncounterId: number;
    FacilityId: number;
    // PriorityId: number;
    // DoctorId: number;
    ProcedureId: number;
    ProcedureName: string;
    DepartmentId: number;
    DepartmentName: string;
    ChiefSurgeonId: number;
    ChiefSurgeonName: string;
    SecondSurgeonId: number;
    SecondSurgeonName: string;
    AssistantSurgeonId: number;
    AssistantSurgeonName: string;
    Comments: string;
    // SurgeonName: string;
    // Startdate: Date;
    // Enddate: Date;
    // StartTime: string;
    // EndTime: string;
    // OTRoomId: number;
    // SurgeryCategoryId: number;
    // AnaesthesiaTypeId: number;
    // SurgeryTypeId: number;
    // ProcedureId: number;
    // OtherProcedureId: number;
    // ProcedureName: string;
    // OtherProcedureName: string;
    // SurgeryName: string;
    // OtherDoctorId: number;
    // OtherSurgeon: string;
    // OTTechnicianId: string;
    // ScurbNurseId: string;
    // AnaesthesistId: number;
    // SurgeryEntryStatusId: number;
    // DepartmentId: number;
    // Remarks: string;
    // TeamId: number;
    // WardId: number;
    // RoomId: number;
    // BedId: number;
    // DiagnosisId: number;
    // DiagnosisName: string;
    // OtherDiagnosisId: number;
    // OtherDiagnosisName: string;
    // OrderId: number;
    // Comments: string;
    // Notes: string;
    // Instruction: string;
    // IOLLensTypeId: number;
    // IOLLensNameId: number;
    // LensPowerId: number;
    // GuarantorId: number;
    // ProcedureSideId: number;
    // ScheduleBy: number;
    // ScheduleDate: Date;
    // ConfirmedBy: number;
    // ConfirmedDate: Date;
    // CancelledBy: number;
    // CancelledDate: Date;
    // IsCathlab: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;

}

export interface SurgeryEntryDetailsInstance extends Instance<SurgeryEntryDetailsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: SurgeryEntryDetailsAttributes;
}
