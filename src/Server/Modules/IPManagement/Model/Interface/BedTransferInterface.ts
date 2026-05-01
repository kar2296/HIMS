import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface BedTransferAttributes extends IAttributes {
    Id: number;
    RequestIdentifier: number;
    EncounterId: number;
    PatientId: number;
    DoctorId: number;
    DepartmentId: number;
    RequestDate: Date;
    TransferDate: Date;
    FromFacilityId: number;
    FromLocationId: number;
    FromWardId: number;
    FromRoomId: number;
    FromBedId: number;
    RequestedBy: number;
    RequestComments: string;
    RequestedStatusId: number;
    ToFacilityId: number;
    ToLocationId: number;
    RemarkId: number;
    ToWardId: number;
    ToRoomId: number;
    ToBedId: number;
    ReqCompletedBy: number;
    ReqCompletedComments: string;
    ServiceRateCategoryId: number;
    ToServiceRateCategoryId: number;
    IsDoubleOccupancy: number;
    AdmissionStatusId: number;
    IsPrimaryBed: boolean;
    IsOtTransfer: boolean;
    ReceivedBy: number;
    ReceivedStatusId: number;
    ReceivedDate: Date;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface BedTransferInstance extends Instance<BedTransferAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: BedTransferAttributes;
}
