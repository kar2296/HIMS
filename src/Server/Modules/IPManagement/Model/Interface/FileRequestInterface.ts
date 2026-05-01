import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface FileRequestAttributes extends IAttributes {
    Id: number;
    MrdRequestId: number;
    RequestIdentifier: string;
    RequestDate: Date;
    RequestTypeId: number;
    MRDTypeId: number;
    PriorityId: number;
    PatientId: number;
    PatientMrn: string;
    EncounterId: number;
    DoctorId: number;
    RequestedDoctorId: number;
    DoctorName: string;
    FromDepartmentId: number;
    ToDepartmentId: number;
    CurrentLocationId: number;
    MRDFileStatusId: number;
    MRDMovementStatusId: number;
    Volume: string;
    ApprovedBy: number;
    ApprovedDate: Date;
    ApproverComments: string;
    Reason: string;
    IsManual: boolean;
    MrdLocId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface FileRequestInstance extends Instance<FileRequestAttributes> {
    // Im exposing every DB column as an instance field to so that tsc wont complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: FileRequestAttributes;
}

