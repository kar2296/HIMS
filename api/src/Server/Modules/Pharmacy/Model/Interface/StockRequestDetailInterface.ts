import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface StockRequestDetailAttributes extends IAttributes {
    Id: number;
    StockTransferDetailId: number;
    StockRequestId: number;
    ItemMasterId: number;
    ItemCode: string;
    ItemName: string;
    QuantityOnHead: number;
    RequestedQuantity: number;
    QuantityOnHand: number;
    TransferedQuantity: number;
    PurchaseUomId: number;
    BaseUomId: number;
    ConversionQuantity: number;
    PurchasePrice: number;
    DiscountModeId: number;
    DiscountAmount: number;
    GstId: number;
    InGstId: number;
    CGstId: number;
    SGstId: number;
    GstPercentage: number;
    InGstPercentage: number;
    CGstPercentage: number;
    SGstPercentage: number;
    GstAmount: number;
    InGstAmount: number;
    CGstAmount: number;
    SGstAmount: number;
    UnitCostPrice: number;
    GrossAmount: number;
    NetAmount: number;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface StockRequestDetailInstance extends Instance<StockRequestDetailAttributes> {
    dataValues: StockRequestDetailAttributes;
}


