import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientDialysisChartAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    EncounterId: number;
    FacilityId: number;
    EncounterTypeId: number;
    DialysisChartDate: Date;
    DialysisChartTime: string;
    DoctorId: number;
    BP: string;
    BF: string;
    AP: string;
    VP: string;
    NP: string;
    UFR: string;
    StartTime: string;
    EndTime: string;
    PreDialysisWt: string;
    PostDialysisWt: string;
    Examinations: string;
    Pulse: string;
    Resp: string;
    Temp: string;
    BIFlow: string;
    NegativePressure: string;
    VenusePressure: string;
    Haparin: string;
    Salin: string;
    CapturedBy: number;
    Signatory: string;
    Sugar: string;
    TreatmentHours: string;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientDialysisChartInstance extends Instance<PatientDialysisChartAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientDialysisChartAttributes;
}
