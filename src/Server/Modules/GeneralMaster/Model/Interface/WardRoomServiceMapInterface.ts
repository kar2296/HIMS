import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface WardRoomServiceMapAttributes extends IAttributes {
    Id: number;
    RoomId: number;
    ServiceItemId: number;
    Quantity: number;
    ApplyMainOccupancy: boolean;
    ApplyDoubleOccupancy: boolean;
    IsHourApply: boolean;
    ActiveStatusId: number;
   // IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface WardRoomServiceMapInstance extends Instance<WardRoomServiceMapAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: WardRoomServiceMapAttributes;
}
