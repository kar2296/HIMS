import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface MRDMovementAttributes extends IAttributes {
    Id: number;
    TransactionId: number;
    BarcodeId: string;
    TransactionDate: Date;
    FacilityId: number;
    OrganisationId: number;
    FromDepartmentId: number;
    ToDepartmentId: number;
    PatientId: number;
    PatientMrn: string;
    EncounterId: number;
    DoctorId: number;
    MRDFileStatusId: number;
    MRDMovementStatusId: number;
    Reason: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface MRDMovementInstance extends Instance<MRDMovementAttributes> {
    // Im exposing every DB column as an instance field to so that tsc wont complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: MRDMovementAttributes;
}

