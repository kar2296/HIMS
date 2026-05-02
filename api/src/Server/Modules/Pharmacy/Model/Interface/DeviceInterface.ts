import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface DeviceAttributes extends IAttributes {
    Id: number;
    DeviceCode: string;
    DeviceName: string;
    Location: string;
    DeviceManufacturerId: number;
    ManufacturerName: string;
    ModelNo: string;
    SerialNo: string;
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

export interface DeviceInstance extends Instance<DeviceAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: DeviceAttributes;
}
