import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface AnalyzerAnalyteMapAttributes extends IAttributes {
    Id: number;
    AssetId: number;
    AssetName: string;
    AssetTypeId: string;
    AnalyzerTestMasterId: number;
    Code: string;
    Name: string;
    Description: string;
    SampleType: string;
    AnalyteId: number;
    AnalyteCode: string;
    AnalyteName: string;
    FacilityId: number;
    IsActive: boolean;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface AnalyzerAnalyteMapInstance extends Instance<AnalyzerAnalyteMapAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AnalyzerAnalyteMapAttributes;
}
