import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface StockSerialMovementAttributes extends IAttributes {
    Id: number;
    StockMovementId: number;
    TransactionDetailId: number;
    StockSerialItemId: number;
    BarCodeId: string;
    ItemMasterId: number;
    TransactionDate: Date;
    BatchId: string;
    ExpiryDate: Date;
    TotalBFQty: number;
    InQty: number;
    OutQty: number;
    TotalAFQty: number;
    Ucp: number;
    Mrp: number;
    ConversionMrp: number;
    IsMultiUse: boolean;
    TotalTransactions: string;
    ConsumedTransactions: string;
    PendingTransactions: string;
    GstId: number;
    GstPercentage: number;
    InGstId: number;
    InGstPercentage: number;
    CGstId: number;
    CGstPercentage: number;
    SGstId: number;
    SGstPercentage: number;
    PurchaseUomId: number;
    BaseUomId: number;
    SaleUomId: number;
    ManufacturerId: number;
    VendorMasterId: number;
    GrnDetailId: number;
    GrnId: number;
    StockEntryDetailId: number;
    StockEntryId: number;
    FacilityId: number;
    OrgId: number;
    StoreMasterId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface StockSerialMovementInstance extends Instance<StockSerialMovementAttributes> {
    dataValues: StockSerialMovementAttributes;
}
