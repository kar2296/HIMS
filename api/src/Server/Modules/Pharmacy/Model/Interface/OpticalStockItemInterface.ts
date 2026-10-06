import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface OpticalStockItemAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    OpticalItemMasterId: number;
    OpticalProductTypeId: number;
    ItemCode: string;
    ItemName: string;
    Quantity: number;
    MinQuantity: number;
    MaxQuantity: number;
    SafetyQuantity: number;
    ReOrderQuantity: number;
    StoreMasterId: number;
    PurchaseUomId: number;
    BaseUomId: number;
    SaleUomId: number;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface OpticalStockItemInstance extends Instance<OpticalStockItemAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: OpticalStockItemAttributes;
}
