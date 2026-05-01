import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.StockSerialItemInstance, i.StockSerialItemAttributes> {
    let StockSerialItem = sequelize.define<i.StockSerialItemInstance, i.StockSerialItemAttributes>('StockSerialItem', {
        Id: { type: DataTypes.BIGINT, field: 'StockSerialItemId', primaryKey: true, autoIncrement: true },
        StockItemId: { type: DataTypes.BIGINT, field: 'StockItemId' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        BarCodeId: { type: DataTypes.STRING, field: 'BarCodeId' },
        ItemMasterId: { type: DataTypes.BIGINT, field: 'ItemMasterId' },
        ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
        ItemName: { type: DataTypes.STRING, field: 'ItemName' },
        BatchId: { type: DataTypes.STRING, field: 'BatchId' },
        ExpiryDate: { type: DataTypes.DATE, field: 'ExpiryDate' },
        Quantity: { type: DataTypes.FLOAT, field: 'Quantity' },
        UomPrice: { type: DataTypes.DECIMAL, field: 'UomPrice' },
        PurchasePrice: { type: DataTypes.DECIMAL, field: 'PurchasePrice' },
        DiscountModeId: { type: DataTypes.BIGINT, field: 'DiscountModeId' },
        Discount: { type: DataTypes.DECIMAL, field: 'Discount' },
        UomDiscountAmount: { type: DataTypes.DECIMAL, field: 'UomDiscountAmount' },
        DiscountAmount: { type: DataTypes.DECIMAL, field: 'DiscountAmount' },
        UomPriceAfterDiscount: { type: DataTypes.DECIMAL, field: 'UomPriceAfterDiscount' },
        PurchasePriceAfterDiscount: { type: DataTypes.DECIMAL, field: 'PurchasePriceAfterDiscount' },
        Ucp: { type: DataTypes.DECIMAL, field: 'Ucp' },
        Mrp: { type: DataTypes.DECIMAL, field: 'Mrp' },
        ConversionMrp: { type: DataTypes.DECIMAL, field: 'ConversionMrp' },
        IsMultiUse: { type: DataTypes.BOOLEAN, field: 'IsMultiUse' },
        TotalTransactions: { type: DataTypes.STRING, field: 'TotalTransactions' },
        ConsumedTransactions: { type: DataTypes.BIGINT, field: 'ConsumedTransactions' },
        PendingTransactions: { type: DataTypes.BIGINT, field: 'PendingTransactions' },
        GstId: { type: DataTypes.BIGINT, field: 'GstId' },
        GstPercentage: { type: DataTypes.DECIMAL, field: 'GstPercentage' },
        GstAmount: { type: DataTypes.DECIMAL, field: 'GstAmount' },
        UnitGstAmount: { type: DataTypes.DECIMAL, field: 'UnitGstAmount' },
        InGstId: { type: DataTypes.BIGINT, field: 'InGstId' },
        InGstPercentage: { type: DataTypes.DECIMAL, field: 'InGstPercentage' },
        InGstAmount: { type: DataTypes.DECIMAL, field: 'InGstAmount' },
        UnitInGstAmount: { type: DataTypes.DECIMAL, field: 'UnitInGstAmount' },
        CGstId: { type: DataTypes.BIGINT, field: 'CGstId' },
        CGstPercentage: { type: DataTypes.DECIMAL, field: 'CGstPercentage' },
        CGstAmount: { type: DataTypes.DECIMAL, field: 'CGstAmount' },
        UnitCGstAmount: { type: DataTypes.DECIMAL, field: 'UnitCGstAmount' },
        SGstId: { type: DataTypes.BIGINT, field: 'SGstId' },
        SGstPercentage: { type: DataTypes.DECIMAL, field: 'SGstPercentage' },
        SGstAmount: { type: DataTypes.DECIMAL, field: 'SGstAmount' },
        UnitSGstAmount: { type: DataTypes.DECIMAL, field: 'UnitSGstAmount' },
        PurchaseUomId: { type: DataTypes.BIGINT, field: 'PurchaseUomId' },
        BaseUomId: { type: DataTypes.BIGINT, field: 'BaseUomId' },
        SaleUomId: { type: DataTypes.BIGINT, field: 'SaleUomId' },
        IsExpiry: { type: DataTypes.BOOLEAN, field: 'IsExpiry' },
        IsSuspended: { type: DataTypes.BOOLEAN, field: 'IsSuspended' },
        ManufacturerId: { type: DataTypes.BIGINT, field: 'ManufacturerId' },
        VendorMasterId: { type: DataTypes.BIGINT, field: 'VendorMasterId' },
        GrnDetailId: { type: DataTypes.BIGINT, field: 'GrnDetailId' },
        GrnId: { type: DataTypes.BIGINT, field: 'GrnId' },
        StockEntryDetailId: { type: DataTypes.BIGINT, field: 'StockEntryDetailId' },
        StockEntryId: { type: DataTypes.BIGINT, field: 'StockEntryId' },
        StockTransferDetailId: { type: DataTypes.BIGINT, field: 'StockTransferDetailId' },
        StockTransferId: { type: DataTypes.BIGINT, field: 'StockTransferId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        BarcodeNo: { type: DataTypes.STRING, field: 'BarcodeNo' },
        IsConsignment: { type: DataTypes.BOOLEAN, field: 'IsConsignment' },
        OrgId: { type: DataTypes.BIGINT, field: 'OrgId' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' }
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'stockserialitems',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (StockSerialItem as any).associate = function (models: Models) {
        StockSerialItem.belongsTo(models.ItemMaster, { foreignKey: 'ItemMasterId' });
        StockSerialItem.belongsTo(models.StoreMaster, { foreignKey: 'StoreMasterId' });
        StockSerialItem.belongsTo(models.VendorMaster, { foreignKey: 'VendorMasterId' });
        StockSerialItem.belongsTo(models.GstMaster, { foreignKey: 'GstId' });
        StockSerialItem.hasMany(models.StockSerialMovement, { as: 'prevstk', foreignKey: 'StockSerialItemId' });
        StockSerialItem.hasMany(models.StockSerialMovement, { as: 'currentstk', foreignKey: 'StockSerialItemId' });
        StockSerialItem.belongsTo(models.Grn);
    };

    return StockSerialItem;
}
