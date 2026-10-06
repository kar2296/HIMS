import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface SurgeryRoomMasterAttributes extends IAttributes {
   Id?: number;
    Code: string;
    Name: string;
    SurgeryRoomTypeId: number;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    FacilityId: number;
    CreatedBy: number;
    CreatedAt?: Date;
    UpdatedBy: number;
    UpdatedAt?: Date;
}

export interface SurgeryRoomMasterInstance extends Instance<SurgeryRoomMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: SurgeryRoomMasterAttributes;
}
