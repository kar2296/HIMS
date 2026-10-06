import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface MRDFileAttachmentAttributes extends IAttributes {
    Id: number;
    PatientId: number;
    MRN: string;
    EncounterId: number;
    VisitIdentifier: string;
    EncounterTypeId: number;
    AdmissionDate: Date;
    CapturedDate: Date;
    MRDFileTypeId: number;
    AttachmentName: string;
    FilePath: string;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    MRDFileStatusId: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface MRDFileAttachmentInstance extends Instance<MRDFileAttachmentAttributes> {
    // Im exposing every DB column as an instance field to so that tsc wont complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: MRDFileAttachmentAttributes;
}
