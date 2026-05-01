import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface OtDocumentAttributes extends IAttributes {
    Id: number;
    OTRegisterId: number;
    PatientId: number;
    EncounterId: number;
    Name: string;
    DocumentTypeId: number;
    FilePath: string;
    DocumentDate: Date;
    ReleaseToPatientId: number;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface OtDocumentInstance extends Instance<OtDocumentAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: OtDocumentAttributes;
}
