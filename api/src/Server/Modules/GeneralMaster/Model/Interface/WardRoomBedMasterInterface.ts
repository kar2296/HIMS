import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface WardRoomBedMasterAttributes extends IAttributes {
    Id: number;
    Code: string;
    WardId: number;
    RoomId: number;
    Description: string;
    BedNo: string;
    Prefix: string;
    IsTemp: boolean;
    LocationId: number;
	ServiceRateCategoryId: number;
    FacilityId: number;
    OrganizationId: number;
    GracePeriod: number;
    HalfDay: number;
    ActiveStatusId: number;
    BedStatusId: number;
    IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface WardRoomBedMasterInstance extends Instance<WardRoomBedMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: WardRoomBedMasterAttributes;
}
