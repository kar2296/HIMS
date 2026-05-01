import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface CarePathPrescriptionAttributes extends IAttributes {
    Id: number;
    CarePathId: number;
    DrugId: number;
    DrugRouteId: number;
    DrugFrequencyId: number;
    GenericId: number;
    GenericName: string;
    DrugName: string;
    Dosage: string;
    Quantity: number;
    Duration: number;
    DurationPeriodId: number;
    Comments: string;
    IsGeneric: boolean;
     IsManditory: boolean;
     ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface CarePathPrescriptionInstance extends Instance<CarePathPrescriptionAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: CarePathPrescriptionAttributes;
}
