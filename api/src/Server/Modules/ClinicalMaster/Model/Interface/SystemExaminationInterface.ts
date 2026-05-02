import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface SystemExaminationAttributes extends IAttributes {
    Id: number;
    Name: string;
    Code: string;
    SysExaminationTypeId: number;
    ActiveStatusId: number;
    IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface SystemExaminationInstance extends Instance<SystemExaminationAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: SystemExaminationAttributes;
}
