import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientDietNbmAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    EncounterId: number;
    PatientDietNbmTypeId: number;
    InvokedBy: number;
    InvokedOn: Date;
    RevokedBy: number;
    PatientDietNbmStatusId: number;
    RevokedOn: Date;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientDietNbmInstance extends Instance<PatientDietNbmAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientDietNbmAttributes;
}
