import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface BedTransportationAttributes extends IAttributes {
    Id: number;
    TransportIdentifier: string;
    EncounterId: number;
    PatientId: number;
    FromRoomId: number;
    FromBedId: number;
    FromWardId: number;
    ToRoomId: number;
    ToBedId: number;
    ToWardId: number;
    FromLocationId: number;
    ToLocationId: number;
    FromBlockId: number;
    ToBlockId: number;
    RequestTypeId: number;
    BedstatusId: number;
    TransportActivityId: number;
    AssignedId: number;
    AmbulanceId: number;
    TransportstatusId: number;
    Comments: string;
    Attachment: string;
    Remarks: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;

}

export interface BedTransportationInstance extends Instance<BedTransportationAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: BedTransportationAttributes;
}
