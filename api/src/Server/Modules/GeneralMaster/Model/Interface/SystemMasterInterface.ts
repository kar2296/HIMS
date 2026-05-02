import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface SystemMasterAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    Code: string;
    SystemName: string;
    SystemTypeId: number;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface SystemMasterInstance extends Instance<SystemMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: SystemMasterAttributes;
}
