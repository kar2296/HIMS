import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface PatientVentilatorChartAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    EncounterId: number;
    FacilityId: number;
    EncounterTypeId: number;
    VentilatorDate: Date;
    VentilatorTime: string;
    VentilatorModeId: number;
    Rate: string;
    TV: string;
    MV: string;
    PS: string;
    Signatory: string;
    PeakPress: string;
    Peep: string;
    MeanPress: number;
    FIO2: string;
    FIO2PercentId: number;
    IsSuction: boolean;
    Posture: string;
    Comments: string;
    PowerScore: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientVentilatorChartInstance extends Instance<PatientVentilatorChartAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientVentilatorChartAttributes;
}
