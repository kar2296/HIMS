import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface StockConsumptionDetailAttributes extends IAttributes {
    Id: number;
    StockConsumptionId: number;
    ConsumptionTypeId: number;
    StoreMasterId: number;
    ItemMasterId: number;
    ExpiryDate: Date;
    QtyBeforeConsumption: number;
    QtyConsumed: number;
    ItemName: string;
    ItemCode: string;
    BatchId: number;
    BarCodeId: number;
    ManufacturedDate: Date;
    QtyBeforeAdjustment: number;
    QtyAdjusted: number;
    QtyAfterConsumption: number;
    QtyAfterAdjusted: number;
    PurchaseUomId: number;
    BaseUomId: number;
    PurchasePrice: number;
    UnitCostPrice: number;
	MrPrice: number;
    GrossAmount: number;
    NetAmount: number;
    StockSerialItemId: number;
    StockItemId: number;
    Comments: string;
    Manufacture: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface StockConsumptionDetailInstance extends Instance<StockConsumptionDetailAttributes> {
    dataValues: StockConsumptionDetailAttributes;
}


