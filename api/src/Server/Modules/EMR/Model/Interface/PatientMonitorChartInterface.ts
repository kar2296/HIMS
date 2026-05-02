import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface PatientMonitorChartAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    EncounterId: number;
    FacilityId: number;
    EncounterTypeId: number;
    MonitorChartDate: Date;
    MonitorChartTime: string;
    Pulse: string;
    BP: string;
    Temperature: string;
    Rate: string;
    LS: string;
    Grade: string;
    LeftPupil: string;
    LeftPupilPercentId: number;
    RightPupil: string;
    RightPupilPercentId: number;
    GIT: string;
    GITPercentId: number;
    SPO2: string;
    SPO2PercentId: number;
    Remarks: string;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientMonitorChartInstance extends Instance<PatientMonitorChartAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientMonitorChartAttributes;
}
