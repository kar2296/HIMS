import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface AssetDocumentAttributes extends IAttributes {
    Id: number;
    DocumentDate: Date;
    DocumentTypeId: number;
    Attachments: string;
    ReleaseToPatientId: number;
    FilePath: string;
    Name: string;
    Comments: string;
    AssetId: number;
	 FacilityId: number;
    AssetName: string;
    Department: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface AssetDocumentInstance extends Instance<AssetDocumentAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AssetDocumentAttributes;
}
