import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PurchaseReturnDetailAttributes extends IAttributes {
    PurchaseReturnDetailId: number;
    PurchaseReturnId: number;
    PrnTypeId: number;
    ReturnReasonId: number;
    VendorMasterId: number;
    StockItemId: number;
    StockSerialItemId: number;
    BarCodeId: number;
    ItemMasterId: number;
    ItemCode: string;
    ItemName: string;
    BatchId: number;
    PoQuantity: number;
    GrnQuantity: number;
    FreeQty: number;
    PrnQuantity: number;
    ExpiryDate: Date;
    ManufacturedDate: Date;
    PurchaseOrderDetailId: number;
    GrnDetailId: number;
    PurchaseUomId: number;
    BaseUomId: number;
    SaleUomId: number;
    ConversionQuantity: number;
    CurrencyId: number;
    UomPrice: number;
    PurchasePrice: number;
    GrossAmount: number;
    DiscountModeId: number;
    Discount: number;
    DiscountAmount: number;
    UomDiscountAmount: number;
    UomPriceAfterDiscount: number;
    PurchasePriceAfterDiscount: number;
    GstId: number;
    GstPercentage: number;
    GstAmount: number;
    UnitGstAmount: number;
    InGstId: number;
    InGstPercentage: number;
    InGstAmount: number;
    UnitInGstAmount: number;
    CGstId: number;
    CGstPercentage: number;
    CGstAmount: number;
    UnitCGstAmount: number;
    SGstId: number;
    SGstPercentage: number;
    SGstAmount: number;
    UnitSGstAmount: number;
    UomCostPrice: number;
    UnitCostPrice: number;
    UomMrPrice: number;
    MrPrice: number;
    NetAmountBeforeGst: number;
    NetAmount: number;
    QtyBeforeReturn: number;
    QtyAfterReturn: number;
    TotalQuantity: number;
    TotalQuantityAfterConversion: number;
    ReturnQty: number;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PurchaseReturnDetailInstance extends Instance<PurchaseReturnDetailAttributes> {
    dataValues: PurchaseReturnDetailAttributes;
}


