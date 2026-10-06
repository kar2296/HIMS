import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientDischargeEventAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    EncounterId: number;
    Pharmacystatus: number;
    OTstatus: number;
    DischargeorderstatusId: number;
    Dischargesummarystatus: number;
    DischargeTypeId: number;
    FitFordischargedate: Date;
    DoctorId: number;
    DepartmentId: number;
    ClicalDischargeId: number;
    DischargeOrderDate: Date;
    ClinicalDischargeDate: Date;
    DeathDate: Date;
    certificateStatusId: number;
    AdmissionStatusId: number;
    OutcomeId: number;
    ModeofTransportId: number;
    Followupdays: number;
    PeriodId: number;
    Ishomemedication: number;
    InfectiontypeId: number;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    FitFordischargeById: number;
    FinancialDischargeById: number;
    FinancialDischargeDate: Date;
    PhysicalDischargeById: number;
    PhysicalDischargeDate: Date;
    AdmissionCancelledById: number;
    AdmissionCancelledDate: Date;
    Tentativedischargedate: Date;
    ClicalDischargeById: number;
}

export interface PatientDischargeEventInstance extends Instance<PatientDischargeEventAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientDischargeEventAttributes;
}
