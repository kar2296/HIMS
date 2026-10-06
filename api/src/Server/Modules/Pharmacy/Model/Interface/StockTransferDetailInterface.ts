import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface StockTransferDetailAttributes extends IAttributes {
    Id: number;
    StockRequestDetailId: number;
    StockTransferId: number;
    VendorMasterId: number;
    ItemMasterId: number;
    StockItemId: number;
    RequestedStoreStockItemId: number;
    StockSerialItemId: number;
    BarCodeId: string;
    ItemCode: string;
    ItemName: string;
    BatchId: string;
    ExpiryDate: Date;
    QuantityBeforeTransfer: number;
    RequestedQuantity: number;
    TransferedQuantity: number;
    QuantityAfterTransfer: number;
    TransitQuantity: number;
    AcceptedQuantity: number;
    PurchaseUomId: number;
    BaseUomId: number;
    ConversionQuantity: number;
    PurchasePrice: number;
    DiscountModeId: number;
    DiscountAmount: number;
    GstId: number;
    GstPercentage: number;
    CGstPercentage: number;
    InGstPercentage: number;
    SGstPercentage: number;
    GstAmount: number;
    CGstAmount: number;
    InGstAmount: number;
    SGstAmount: number;
    UnitCostPrice: number;
    MrPrice: number;
    GrossAmount: number;
    NetAmount: number;
    Comments: string;
    GrnId: number;
    InGstId: number;
    CGstId: number;
    SGstId: number;
    GrnDetailId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface StockTransferDetailInstance extends Instance<StockTransferDetailAttributes> {
    dataValues: StockTransferDetailAttributes;
}


