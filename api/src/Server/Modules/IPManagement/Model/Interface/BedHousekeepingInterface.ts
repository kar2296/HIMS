import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface BedHousekeepingAttributes extends IAttributes {
    Id: number;
    RequestIdentifier: string;
    TransactionId: number;
    EncounterId: number;
    PatientId: number;
    LocationId: number;
    RoomId: number;
    BedId: number;
    WardId: number;
    RequestTypeId: number;
    BedStatusId: number;
    HousekeepingActivityId: number;
    AssignedId: number;
    HousekeepingStatusId: number;
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

export interface BedHousekeepingInstance extends Instance<BedHousekeepingAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: BedHousekeepingAttributes;
}
