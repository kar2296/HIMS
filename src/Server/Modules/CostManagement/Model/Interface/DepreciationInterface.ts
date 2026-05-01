import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface DepreciationAttributes extends IAttributes {
    Id: number;
    DocumentDate: Date;
    DocumentTypeId: number;
    Attachments: string;
    ReleaseToPatientId: number;
    Name: string;
    Cost: number;
    FilePath: string;
    Comments: string;
    AssetId: number;
    AssetTypeId: number;
    AssetName: string;
    Department: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface DepreciationInstance extends Instance<DepreciationAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: DepreciationAttributes;
}
