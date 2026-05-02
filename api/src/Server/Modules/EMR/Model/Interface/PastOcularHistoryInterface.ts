import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PastOcularHistoryAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    EncounterId: number;
    EncounterTypeId: number;
    PreviousEyeProblems: string;
    RefractiveErrorId: number;
    OcularSurgery: string;
    OcularTrauma: string;
    LazyEye: string;
    Others: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PastOcularHistoryInstance extends Instance<PastOcularHistoryAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PastOcularHistoryAttributes;
}
