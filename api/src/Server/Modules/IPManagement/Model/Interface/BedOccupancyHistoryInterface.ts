import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface BedOccupancyHistoryAttributes extends IAttributes {
    Id: number;
    TransactionIdentifier: string;
    FacilityId: number;
    EncounterId: number;
    PatientId: number;
    LocationId: number;
    WardId: number;
    DepartmentId: number;
    DoctorId: number;
    RoomId: number;
    BedId: number;
    PatientBillId: number;
    AdmissionDate: Date;
    DischargeDate: Date;
    OccupancyStatusId: number;
    ServiceRateCategoryId: number;
    AdmitStatusId: number;
    IsPrimaryBed: boolean;
    BillingStartDate: Date;
    BillingEndDate: Date;
    BillingAmount: number;
    IsDoubleOccupancy: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface BedOccupancyHistoryInstance extends Instance<BedOccupancyHistoryAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: BedOccupancyHistoryAttributes;
}
