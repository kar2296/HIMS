import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientGeneralHistoryAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    EncounterId: number;
    EncounterTypeId: number;
    CaptureDate: Date;
    GeneralHistory: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientGeneralHistoryInstance extends Instance<PatientGeneralHistoryAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientGeneralHistoryAttributes;
}
