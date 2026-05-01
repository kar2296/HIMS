import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface StockAdjustmentDetailAttributes extends IAttributes {
    Id: number;
    StockAdjustmentId: number;
    StoreMasterId: number;
    ItemMasterId: number;
    ItemName: string;
    ItemCode: string;
    BatchId: number;
    AdjustedTypeId: number;
    BarcodeId: number;
    ExpiryDate: Date;
    ManufacturedDate: Date;
    TotalQtyBeforeAdj: number;
    BatchQtyBeforeAdj: number;
    QtyAdjusted: number;
    BatchQtyAfterAdj: number;
    TotalQtyAfterAdj: number;
    PurchaseUomId: number;
    BaseUomId: number;
    PurchasePrice: number;
    UnitCostPrice: number;
    MrPrice: number;
    GrossAmount: number;
    NetAmount: number;
    StockSerialItemId: number;
    StockItemId: number;
    Manufacture: string;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface StockAdjustmentDetailInstance extends Instance<StockAdjustmentDetailAttributes> {
    dataValues: StockAdjustmentDetailAttributes;
}


