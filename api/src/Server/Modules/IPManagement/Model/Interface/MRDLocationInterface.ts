import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface MRDLocationAttributes extends IAttributes {
    Id: number;
    BarcodeId: string;
    TransactionDate: Date;
    FacilityId: number;
    OrganisationId: number;
    DepartmentId: number;
    PatientId: number;
    PatientMrn: string;
    EncounterId: number;
    DoctorId: number;
    RackId: number;
    LocationId: number;
    Self: string;
    Reason: string;
    MisplacedReason: string;
    DamagedReason: string;
    IsManual: string;
    PriorityId: number;
    MRDTypeId: number;
    RequestTypeId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    MRDFileStatusId: number;
    MRDMovementStatusId: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface MRDLocationInstance extends Instance<MRDLocationAttributes> {
    // Im exposing every DB column as an instance field to so that tsc wont complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: MRDLocationAttributes;
}

