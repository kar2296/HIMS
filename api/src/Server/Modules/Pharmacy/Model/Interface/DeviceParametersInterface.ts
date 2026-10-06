import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface DeviceParametersAttributes extends IAttributes {
    Id: number;
    Code: string;
    Name: string;
    Description: string;
    UOM: string;
    Mnemonic: string;
    DisplayOrder: string;
    DeviceParameterTypeId: number;
    OrganizationId: number;
    FacilityId: number;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface DeviceParametersInstance extends Instance<DeviceParametersAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: DeviceParametersAttributes;
}
