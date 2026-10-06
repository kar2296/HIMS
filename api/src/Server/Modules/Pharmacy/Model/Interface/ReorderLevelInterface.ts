import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ReorderLevelAttributes extends IAttributes {
    Id: number;
    ItemMasterId: number;
    StoreMasterId: number;
    FacilityId: number;
    ProductTypeId: number;
    SubProductTypeId: number;
    ItemCode: string;
    ItemName: string;
    StoreName: string;
    FacilityName: string;
    MinQty: number;
    MaxQty: number;
    ROLQty: number;
    LeadTime: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ReorderLevelInstance extends Instance<ReorderLevelAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ReorderLevelAttributes;
}
