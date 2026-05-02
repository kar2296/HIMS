import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface StockEntryDetailAttributes extends IAttributes {
    Id: number;
    StockEntryId: number;
    BarCodeId: string;
    ItemMasterId: number;
    ItemCode: string;
    ItemName: string;
    BatchId: string;
    EntryQuantity: number;
    ExpiryDate: Date;
    ManufacturedDate: Date;
    PurchaseUomId: number;
    BaseUomId: number;
    ConversionQuantity: number;
    TotalConversionQuantity: number;
    CurrencyId: number;
    PurchasePrice: number;
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
    Mrp: number;
    GrossAmount: number;
    NetAmountBeforeGst: number;
    NetAmount: number;
    QtyBeforeEntry: number;
    QtyAfterEntry: number;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface StockEntryDetailInstance extends Instance<StockEntryDetailAttributes> {
    dataValues: StockEntryDetailAttributes;
}


