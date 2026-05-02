import {IAudit} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface DrugDiagnosisMapAttributes extends IAudit {
    Id?: number;
    DrugId: number;
    DiagnosisId: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface DrugDiagnosisMapInstance extends Instance<DrugDiagnosisMapAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: DrugDiagnosisMapAttributes;
}
