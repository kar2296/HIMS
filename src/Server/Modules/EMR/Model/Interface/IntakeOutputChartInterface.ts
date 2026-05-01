import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface IntakeOutputChartAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    EncounterId: number;
    FacilityId: number;
    EncounterTypeId: number;
    IntakeOutputChartDate: Date;
    IntakeOutputChartTime: string;
    IV: number;
    Oral: number;
    IVName: string;
    OralName: string;
    Drains: number;
    IntakeTotal: number;
    Urine: number;
    Aspiration: number;
    VomitousDiarhoea: number;
    OutputTotal: number;
    Signatory: string;
    CapturedBy: number;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface IntakeOutputChartInstance extends Instance<IntakeOutputChartAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: IntakeOutputChartAttributes;
}
