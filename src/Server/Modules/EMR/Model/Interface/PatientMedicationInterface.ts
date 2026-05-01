import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientMedicationAttributes extends IAttributes {
    Id: number;
    EncounterId: number;
    ConsultationId: number;
    PatientId: number;
    DrugId: number;
    IsGeneric: boolean;
    GenericId: number;
    PrescriptionId: number;
    DrugCode: string;
    DrugName: string;
    Description: string;
    DrugFormId: number;
    StartDate: Date;
    EndDate: Date;
    MedicationStatus: number;
    Comments: string;
    PatientMedicationStatusId: number;
    PerformedDate: Date;
    PerformedBy: number;
    Dosage: string;
    Morning: number;
    Noon: number;
    Night: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientMedicationInstance extends Instance<PatientMedicationAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientMedicationAttributes;
}
