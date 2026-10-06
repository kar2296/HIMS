import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ExaminationMasterAttributes extends IAttributes {
    Id: number;
    Name: string;
    Code: string;
    ExaminationMasterTypeId: number;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ExaminationMasterInstance extends Instance<ExaminationMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ExaminationMasterAttributes;
}
