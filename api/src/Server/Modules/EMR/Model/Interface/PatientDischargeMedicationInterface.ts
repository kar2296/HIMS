import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientDischargeMedicationAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    EncounterId: number;
    ConsultationId: number;
    DrugId: number;
    DrugName: string;
    IsSelectedDrug: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientDischargeMedicationInstance extends Instance<PatientDischargeMedicationAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientDischargeMedicationAttributes;
}
