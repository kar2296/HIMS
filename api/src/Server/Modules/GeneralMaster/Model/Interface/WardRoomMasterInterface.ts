import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface WardRoomMasterAttributes extends IAttributes {
    Id: number;
    Code: string;
    RoomName: string;
    WardId: number;
    RoomTypeId: number;
    RoomNo: string;
    Description: string;
    RoomClassificationTypeId: number;
    LocationId: number;
    ServiceRateCategoryId: number;
    FacilityId: number;
    OrganizationId: number;
    GracePeriod: number;
    HalfDay: number;
    PhotoPath: string;
    NoOfBed: number;
    BedStartNo: number;
    Prefix: string;
    ActiveStatusId: number;
    IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface WardRoomMasterInstance extends Instance<WardRoomMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: WardRoomMasterAttributes;
}
