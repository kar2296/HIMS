import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PurchaseRequestDetailAttributes extends IAttributes {
    Id: number;
    PurchaseRequestId: number;
    VendorMasterId: number;
    StoreMasterId: number;
    ToStoreMasterId: number;
    ItemMasterId: number;
    ItemCode: string;
    ItemName: string;
    QuantityOnHand: number;
    StockInHand: number;
    RequestedQuantity: number;
    FreeQty: number;
    PurchaseUomId: number;
    BaseUomId: number;
    ConversionQuantity: number;
    PurchasePrice: number;
    DiscountModeId: number;
    Discount: number;
    DiscountAmount: number;
    PurchasePriceAfterDiscount: number;
    GstId: number;
    GstPercentage: number;
    GstAmount: number;
    InGstId: number;
    InGstPercentage: number;
    InGstAmount: number;
    CGstId: number;
    CGstPercentage: number;
    CGstAmount: number;
    SGstId: number;
    SGstPercentage: number;
    SGstAmount: number;
    UnitCostPrice: number;
    MrPrice: number;
    GrossAmount: number;
    NetAmount: number;
    PurchaseOrderDetailId: number;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PurchaseRequestDetailInstance extends Instance<PurchaseRequestDetailAttributes> {
    dataValues: PurchaseRequestDetailAttributes;
}


