import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PositionBpChartAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    EncounterId: number;
    FacilityId: number;
    EncounterTypeId: number;
    PositionBPChartDate: Date;
    PositionBPChartTime: string;
    RightSittingSys: string;
    RightSittingDia: string;
    LeftSittingSys: string;
    LeftSittingDia: string;
    RightStandingSys: string;
    RightStandingDia: string;
    LeftStandingSys: string;
    LeftStandingDia: string;
    RightLyingSys: string;
    RightLyingDia: string;
    LeftLyingSys: string;
    LeftLyingDia: string;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PositionBpChartInstance extends Instance<PositionBpChartAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PositionBpChartAttributes;
}
