import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface OtScheduleAttributes extends IAttributes {
    Id?: number;                          // BIGINT, auto-increment (optional)
    OTScheduledOn: Date;                  // DATE
    PatientId: number;                    // BIGINT
    ScheduleTypeId: number;               // BIGINT
    EncounterId: number;                  // BIGINT
    FacilityId: number;                   // BIGINT
    PriorityId: number;                   // BIGINT
    DoctorId: number;                     // BIGINT
    SurgeonName: string;                  // STRING
    Startdate: Date;                      // DATE
    Enddate: Date;                        // DATE
    StartTime: string;                    // TIME
    EndTime: string;                      // TIME
    OTRoomId: number;                     // BIGINT
    SurgeryCategoryId: number;            // BIGINT
    AnaesthesiaTypeId: number;            // BIGINT
    OTTechnicianId: string;               // STRING
    ScurbNurseId: string;                 // STRING
    SurgeryTypeId: number;                // BIGINT
    ProcedureId: number;                  // BIGINT
    OtherProcedureId: number;             // BIGINT
    ProcedureName: string;                // STRING
    OtherProcedureName: string;           // STRING
    OtherDoctorId: number;                // BIGINT
    OtherSurgeon: string;                 // STRING
    AnaesthesistId: number;               // BIGINT
    OTScheduleStatusId: number;           // BIGINT
    Remarks: string;                      // STRING
    DepartmentId: number;                 // BIGINT
    TeamId: number;                       // BIGINT
    WardId: number;                       // BIGINT
    RoomId: number;                       // BIGINT
    BedId: number;                        // BIGINT
    DiagnosisId: number;                  // BIGINT
    DiagnosisName: string;                // STRING
    OtherDiagnosisId: number;             // BIGINT
    OtherDiagnosisName: string;           // STRING
    OrderId: number;                      // BIGINT
    Comments: string;                     // STRING
    Notes: string;                        // STRING
    Instruction: string;                  // STRING
    IOLLensTypeId: number;                // BIGINT (NOT IOLLensTypeName!)
    IOLLensNameId: number;                // BIGINT (NOT IOLLensName!)
    LensPowerId: number;                  // BIGINT
    GuarantorId: number;                  // BIGINT
    ProcedureSideId: number;              // BIGINT
    ScheduleBy: number;                   // BIGINT
    ScheduleDate: Date;                   // DATE
    SurgeryEndDate: Date;                 // DATE
    ConfirmedBy: number;                  // BIGINT
    ConfirmedDate: Date;                  // DATE
    CancelledBy: number;                  // BIGINT
    CancelledDate: Date;                  // DATE
    IsCathlab: boolean;                   // BOOLEAN
    Status: number;                       // INTEGER
    Rev: number;                          // INTEGER
    CreatedBy: number;                    // INTEGER
    CreatedAt?: Date;                     // DATE (optional, managed by Sequelize)
    UpdatedBy: number;                    // INTEGER
    UpdatedAt?: Date;                     // DATE (optional, managed by Sequelize)
}

export interface OtScheduleInstance extends Instance<OtScheduleAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: OtScheduleAttributes;
}
