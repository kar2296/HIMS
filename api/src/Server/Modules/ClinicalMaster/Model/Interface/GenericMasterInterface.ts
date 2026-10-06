import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface GenericMasterAttributes extends IAttributes {
    Id: number;
    Code: string;
    GenericName: string;
    Description: string;
    AllergenTypeId: number;
    ScheduleTypeId: number;
    IsPrescribed: boolean;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface GenericMasterInstance extends Instance<GenericMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: GenericMasterAttributes;
}
