import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface TreatementModalityAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    ModalityName: string;
    ModalityCode: string;
    Description: string;
    IsActive: boolean;
    Status: number;
    Rev: number;
    Createdby: number;
    CreatedAt: Date;
    Updatedby: number;
    UpdatedAt: Date;
    ActiveStatusId: number;
}

export interface TreatementModalityInstance extends Instance<TreatementModalityAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: TreatementModalityAttributes;
}
