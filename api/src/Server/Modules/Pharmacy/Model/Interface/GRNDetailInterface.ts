import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface GrnDetailAttributes extends IAttributes {
    Id: number;
    GrnId: number;
    ItemVendorMapId: number;
    VendorMasterId: number;
    StoreMasterId: number;
    BarCodeId: number;
    ItemFacilityMapId: number;
    ItemMasterId: number;
    ItemCode: string;
    ItemName: string;
    IsMultiUse: boolean;
    NoOfTransactions: string;
    BatchId: string;
    PoQuantity: number;
    GrnQuantity: number;
    FreeQty: number;
    ExpiryDate: Date;
    ManufacturedDate: Date;
    PurchaseUomId: number;
    BaseUomId: number;
    SaleUomId: number;
    ConversionQuantity: number;
    GrnQuantityAfterConversion: number;
    FreeQtyAfterConversion: number;
    CurrencyId: number;
    UomPrice: number;
    PurchasePrice: number;
    DiscountModeId: number;
    Discount: number;
    DiscountMode1Id: number;
    Discount1: number;
    DiscountMode2Id: number;
    Discount2: number;
    UomDiscountAmount: number;
    UomDiscount1Amount: number;
    UomDiscount2Amount: number;
    DiscountAmount: number;
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
    Mrp: number;
    GrossAmount: number;
    NetAmountBeforeGst: number;
    NetAmount: number;
    PurchaseOrderId: number;
    PurchaseOrderDetailId: number;
    QtyBeforeGrn: number;
    QtyAfterGrn: number;
    TotalQuantity: number;
    TotalQuantityAfterConversion: number;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    TaxableAmount: number;
}

export interface GrnDetailInstance extends Instance<GrnDetailAttributes> {
    dataValues: GrnDetailAttributes;
}


