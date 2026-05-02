import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface OpticalGrnDetailAttributes extends IAttributes {
    Id: number;
    OpticalGrnId: number;
    VendorMasterId: number;
    StoreMasterId: number;
    OpticalBarCodeId: number;
    OpticalItemMasterId: number;
    OpticalItemCode: string;
    OpticalItemName: string;
    PoQuantity: number;
    GrnQuantity: number;
    FreeQty: number;
    ManufacturedDate: Date;
    PurchaseUomId: number;
    BaseUomId: number;
    SaleUomId: number;
    ConversionQuantity: number;
    GrnQuantityAfterConversion: number;
    FreeQtyAfterConversion: number;
    UomPrice: number;
    PurchasePrice: number;
    DiscountModeId: number;
    Discount: number;
    UomDiscountAmount: number;
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
    UomMRP: number;
    MRP: number;
    GrossAmount: number;
    NetAmountBeforeGst: number;
    NetAmount: number;
    OpticalPurchaseOrderId: number;
    OpticalPurchaseOrderDetailId: number;
    QtyBeforeGrn: number;
    QtyAfterGrn: number;
    TotalQuantity: number;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface OpticalGrnDetailInstance extends Instance<OpticalGrnDetailAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: OpticalGrnDetailAttributes;
}
