import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface CdChartAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    EncounterId: number;
    FacilityId: number;
    EncounterTypeId: number;
    CdChartDate: Date;
    CdChartTime: string;
    Cd4: string;
    Cd8: string;
    ViralLoad: string;
    CreatedById: number;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface CdChartInstance extends Instance<CdChartAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: CdChartAttributes;
}
