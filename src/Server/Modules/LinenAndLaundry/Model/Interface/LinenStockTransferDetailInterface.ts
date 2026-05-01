import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface LinenStockTransferDetailAttributes extends IAttributes {
    Id: number;
    LinenStockTransferId: number;
    LinenStockRequestDetailId: number;
    LinenItemMasterId:number;
    LinenItemName:string;
    LinenItemCode:string;
    Quantity: number;
    RequestedQuantity: number;
    IssuedQuantity: number;
    PendingQuantity:number;
    ReceivedQuantity:number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface LinenStockTransferDetailInstance extends Instance<LinenStockTransferDetailAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: LinenStockTransferDetailAttributes;
}
