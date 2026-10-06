import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface StockItemAttributes extends IAttributes {
    Id: number;
    ItemMasterId: number;
    ItemCode: string;
    ItemName: string;
    Quantity: number;
    MinQuantity: number;
    MaxQuantity: number;
    SafetyQuantity: number;
    ReOrderQuantity: number;
    StoreMasterId: number;
    FacilityId: number;
    IsConsignment: boolean;
    OrgId: number;
    PurchaseUomId: number;
    BaseUomId: number;
    SaleUomId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface StockItemInstance extends Instance<StockItemAttributes> {
    dataValues: StockItemAttributes;
}
