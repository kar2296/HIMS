import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientDietPlanAttributes extends IAttributes {
    Id: number;
    EncounterId: number;
    ConsultationId: number;
    PatientId: number;
    DietTypes: string;
    DietPreferrenceId: number;
    FoodPreferrence: string;
    TherapeuticDietId: number;
    Remarks: string;
    StartDate: Date;
    EndDate: Date;
    Comments: string;
    PerformedDate: number;
    PerformedBy: number;
    PatientDietPlanStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientDietPlanInstance extends Instance<PatientDietPlanAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientDietPlanAttributes;
}
