import * as i from './Interface/Index';
import * as SequelizeStatic from 'sequelize';
declare global {
    interface Models {
        LinenItemMaster: SequelizeStatic.Model<i.LinenItemMasterInstance, i.LinenItemMasterAttributes>;
        LinenStockItems: SequelizeStatic.Model<i.LinenStockItemsInstance, i.LinenStockItemsAttributes>;
        LinenStockTransfer: SequelizeStatic.Model<i.LinenStockTransferInstance, i.LinenStockTransferAttributes>;
        LinenStockTransferDetail: SequelizeStatic.Model<i.LinenStockTransferDetailInstance, i.LinenStockTransferDetailAttributes>;
        LinenStockEntry: SequelizeStatic.Model<i.LinenStockEntryInstance, i.LinenStockEntryAttributes>;
        LinenStockEntryDetail: SequelizeStatic.Model<i.LinenStockEntryDetailInstance, i.LinenStockEntryDetailAttributes>;
    }
}
