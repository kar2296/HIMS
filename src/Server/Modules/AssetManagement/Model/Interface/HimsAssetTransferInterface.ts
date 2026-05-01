import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface AssetTransferAttributes extends IAttributes {
    Id: number;
    AssetTransferId: number;
    AssetId: number;
    AssetTransferNo: string;
    FromDepartmentId: number;
    LocationId: number;
    FromFacilityId: number;
    TOFacilityId: number;
    ToDepartmentId: number;
    RequestedById: number;
    ApprovedById: number;
    RequestedDate: Date;
    ApprovedDate: Date;
    TransferedDate: Date;
    TransferedById: number;
    TransferId: string;
    Purpose: string;
    Comments: string;
    AssetName: string;
    AssetTransferStatusId: number;
    ToUserId: number;
    Search: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface AssetTransferInstance extends Instance<AssetTransferAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AssetTransferAttributes;
}
