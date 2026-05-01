import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface LinenStockEntryDetailAttributes extends IAttributes {
    Id: number;
    LinenStockEntryId: number;
    LinenItemMasterId: number;
    LinenItemCode: string;
    LinenItemName: string;
    LinenType: string;
    Quantity: number;
    Price: number;
    Amount: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface LinenStockEntryDetailInstance extends Instance<LinenStockEntryDetailAttributes> {
    dataValues: LinenStockEntryDetailAttributes;
}


