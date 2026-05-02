import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface DeviceManufacturerAttributes extends IAttributes {
    Id: number;
    DeviceManufacturerCode: string;
    DeviceManufacturerName: string;
    VersionName: string;
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

export interface DeviceManufacturerInstance extends Instance<DeviceManufacturerAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: DeviceManufacturerAttributes;
}
