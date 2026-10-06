import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientInsuranceChecklistAttributes extends IAttributes {
    Id: number;
    PatientId:number;
    GuarantorId:number;
    EncounterId:number;
    ChecklistId:number;
    ChecklistStatusId:number;
    PatientBillId:number;
    EncounterTypeId:number;
    GuarantorTypeId:number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientInsuranceChecklistInstance extends Instance<PatientInsuranceChecklistAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientInsuranceChecklistAttributes;
}
