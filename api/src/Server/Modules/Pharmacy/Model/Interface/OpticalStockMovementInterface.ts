import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface OpticalStockMovementAttributes extends IAttributes {
    Id: number;
    FacilityId: number;
    OpticalStockItemId: number;
    OpticalItemMasterId: number;
    OpticalProductTypeId: number;
    OpticalTransactionTypeId: number;
    TransactionId: number;
    TransactionNumber: string;
    TransactionDate: Date;
    TotalBFQty: number;
    TransactionQty: number;
    InQty: number;
    OutQty: number;
    TotalAFQty: number;
    StoreMasterId: number;
    FromStoreMasterId: number;
    ToStoreMasterId: number;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface OpticalStockMovementInstance extends Instance<OpticalStockMovementAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: OpticalStockMovementAttributes;
}
