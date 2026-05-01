import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface SurgeryEntryAttributes extends IAttributes {
     Id?: number;
    SurgeryIdentifier: string;
    FacilityId: number;
    SurgeryRegisteredOn: Date;
    PatientId: number;
    PatientMrn: string;
    EncounterId: number;
    SurgeryScheduleId: number;
    SurgeryRequestId: number;
    SurgeryRequestedOn: Date;
    AdmissionDoctorId: number;
    DoctorName: string;
    SurgeryStartedate: Date;
    SurgeryEndDate: Date;
    StartTime: string; // TIME type
    EndTime: string; // TIME type
    WardId: number;
    RoomId: number;
    BedId: number;
    DiagnosisId: number;
    DiagnosisName: string;
    OtherDiagnosisId: number;
    OtherDiagnosisName: string;
    SurgeryRoomId: number;
    SurgeryTypeId: number;
    ServiceRateCategoryId: number;
    AnaesthesiaTypeId: number;
    ChiefSurgeonId: number;
    AssistantSurgeonId: number;
    AnaesthesistId: number;
    ChiefSurgeon2Id: number;
    AssistantSurgeon2Id: number;
    Anaesthesist2Id: number;
    ChiefSurgeon3Id: number;
    AssistantSurgeon3Id: number;
    Anaesthesist3Id: number;
    PreoperativeDignosisId: number;
    SurgeryEntryStatusId: number;
    ProcedureId: number;
    Procedure2Id: number;
    Procedure3Id: number;
    ProcedureName: string;
    OtherDiagnosis: string;
    OtherSurgeon: string;
    ConsultationId: number;
    Comments: string;
    IsCathlab: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt?: Date;
    UpdatedBy: number;
    UpdatedAt?: Date;
}

export interface SurgeryEntryInstance extends Instance<SurgeryEntryAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: SurgeryEntryAttributes;
}
