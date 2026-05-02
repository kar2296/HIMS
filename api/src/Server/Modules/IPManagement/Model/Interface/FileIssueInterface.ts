import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface FileIssueAttributes extends IAttributes {
    Id: number;
    MrdIssueId: number;
    IssueIdentifier: string;
    IssueDate: Date;
    IssueTypeId: number;
    MrdRequestId: number;
    PatientId: number;
    PatientMrn: string;
    EncounterId: number;
    DoctorId: number;
    DoctorName: string;
    FromDepartmentId: number;
    ToDepartmentId: number;
    CurrentLocationId: number;
    IssueStatusId: number;
    Volume: string;
    IssuedBy: number;
    AcceptedBy: number;
    AcceptedDate: Date;
    ApproverComments: string;
    Reason: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface FileIssueInstance extends Instance<FileIssueAttributes> {
    // Im exposing every DB column as an instance field to so that tsc wont complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: FileIssueAttributes;
}

