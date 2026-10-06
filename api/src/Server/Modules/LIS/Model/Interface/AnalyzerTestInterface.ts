import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface AnalyzerTestAttributes extends IAttributes {
    Id: number;
    AssetId: number;
    FacilityId: number;
    Code: string;
    AssetName: string;
    Name: string;
    Description: string;
    AssetTypeId: string;
    Barcode: string;
    DisplayNo: number;
    EquipmentName: string;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface AnalyzerTestInstance extends Instance<AnalyzerTestAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AnalyzerTestAttributes;
}
