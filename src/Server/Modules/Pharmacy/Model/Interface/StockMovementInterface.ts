import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface StockMovementAttributes extends IAttributes {
    Id: number;
    StockItemId: number;
    ItemMasterId: number;
    TransactionTypeId: number;
    TransactionId: number;
    // TransactionDetailId: number;
    TransactionNumber: string;
    TransactionReference: string;
    TransactionDate: Date;
    TotalBFQty: number;
    InQty: number;
    OutQty: number;
    TotalAFQty: number;
    IsMultiUse: boolean;
    TotalTransactions: string;
    ConsumedTransactions: string;
    PendingTransactions: string;
    StoreMasterId: number;
    FromStoreMasterId: number;
    ToStoreMasterId: number;
    FacilityId: number;
    OrgId: number;
    Ucp: number;
    Mrp: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface StockMovementInstance extends Instance<StockMovementAttributes> {
    dataValues: StockMovementAttributes;
}
