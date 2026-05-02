import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface AssetAccessoriesAttributes extends IAttributes {
    Id: number;
    AssetAccessoriesId: string;
    AccessoriesName: string;
    SerialNO: string;
	FacilityId: number;
    WarrentyFrom: Date;
    WarrentyTo: Date;
    PO: Date;
    Cost: number;
    Description: string;
    AssetId: number;
    AssetName: string;
    Department: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface AssetAccessoriesInstance extends Instance<AssetAccessoriesAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: AssetAccessoriesAttributes;
}
