import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface EmarAttributes extends IAttributes {
    Id: number;
    PrescriptionId: number;
    PrescriptionDetailId: number;
    PatientId: number;
    EncounterId: number;
    StoreMasterId: number;
    DrugId: number;
    DrugCode: string;
    DrugName: string;
    Dosage: string;
    Duration: number;
    DurationPeriodId: number;
    STAT: boolean;
    Morning: number;
    Noon: number;
    Night: number;
    DrugInstructionId: number;
    Quantity: number;
    AdministerDosage: string;
    AdministeredQuantity: number;
    AdministerStatusId: number;
    AdministerInstructions: string;
    AdministeredBy: number;
    AdministeredDate: Date;
    StartDate: Date;
    EndDate: Date;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface EmarInstance extends Instance<EmarAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: EmarAttributes;
}

