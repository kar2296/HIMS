import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface AssetWarrantyAttributes extends IAttributes {
    Id: number;
    AssetId: string;
    WarrantyTypeId: number;
    Comments: string;
    NoOfFreeServices: number;
    NoOfPendingServices: number;
    FromDate: Date;
    ToDate: Date;
    FacilityId: number;
    DepartmentId: number;
    DepartmentName: string;
    ActiveStatusId: number;
    CostValue: number;
    ReferenceNumber: string;
    IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface AssetWarrantyInstance extends Instance<AssetWarrantyAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AssetWarrantyAttributes;
}
