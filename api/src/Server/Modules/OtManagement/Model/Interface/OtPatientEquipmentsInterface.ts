import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface OtPatientEquipmentsAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    OTRegisterId: number;
    EncounterId: number;
    WardId: number;
    RoomId: number;
    BedId: number;
    OTRoomId: number;
    ServiceRateCategoryId: number;
    EquipmentId: number;
    IsBilled: number;
    ChargeTypeId: number;
    EquipmentName: string;
    Comments:string;
    StartTime: Date;
    StopTime: Date;
    StartedBy: number;
    StoppedBy: number;
    TotalHours: number;
    Rate: number;
    TotalAmount: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;

}

export interface OtPatientEquipmentsInstance extends Instance<OtPatientEquipmentsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: OtPatientEquipmentsAttributes;
}
