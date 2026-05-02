import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PurchaseOrderDetailAttributes extends IAttributes {
    Id: number;
    PurchaseOrderId: number;
    ItemVendorMapId: number;
    VendorMasterId: number;
    StoreMasterId: number;
    DeliveryStoreMasterId: number;
    ItemFacilityMapId: number;
    ItemMasterId: number;
    ItemCode: string;
    ItemName: string;
    GenericId: number;
    AvailableQuantity: number;
    PoQuantity: number;
    PrQuantity: number;
    FreeQty: number;
    ReceivedQuantity: number;
    PurchaseUomId: number;
    BaseUomId: number;
    ConversionQuantity: number;
    TotalQuantity: number;
    TotalQuantityAfterConversion: number;
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
    NetAmount: number;
    SaleAmount: number;
    ProfitAmount: number;
    PurchaseRequestDetailId: number;
    BatchExpiryDate: Date;
    BatchId: string;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PurchaseOrderDetailInstance extends Instance<PurchaseOrderDetailAttributes> {
    dataValues: PurchaseOrderDetailAttributes;
}


