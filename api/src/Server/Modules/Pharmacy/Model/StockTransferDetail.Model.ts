import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.StockTransferDetailInstance, i.StockTransferDetailAttributes> {
    let StockTransferDetail = sequelize.define<i.StockTransferDetailInstance, i.StockTransferDetailAttributes>('StockTransferDetail', {
        Id: { type: DataTypes.BIGINT, field: 'StockTransferDetailId', primaryKey: true, autoIncrement: true },
        StockRequestDetailId: { type: DataTypes.BIGINT, field: 'StockRequestDetailId' },
        StockTransferId: { type: DataTypes.BIGINT, field: 'StockTransferId' },
        VendorMasterId: { type: DataTypes.BIGINT, field: 'VendorMasterId' },
        ItemMasterId: { type: DataTypes.BIGINT, field: 'ItemMasterId' },
        StockItemId: { type: DataTypes.BIGINT, field: 'StockItemId' },
        RequestedStoreStockItemId: { type: DataTypes.BIGINT, field: 'RequestedStoreStockItemId' },
        StockSerialItemId: { type: DataTypes.BIGINT, field: 'StockSerialItemId' },
        BarCodeId: { type: DataTypes.STRING, field: 'BarCodeId' },
        ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
        ItemName: { type: DataTypes.STRING, field: 'ItemName' },
        BatchId: { type: DataTypes.STRING, field: 'BatchId' },
        ExpiryDate: { type: DataTypes.DATE, field: 'ExpiryDate' },
        QuantityBeforeTransfer: { type: DataTypes.FLOAT, field: 'QuantityBeforeTransfer' },
        RequestedQuantity: { type: DataTypes.FLOAT, field: 'RequestedQuantity' },
        TransferedQuantity: { type: DataTypes.FLOAT, field: 'TransferedQuantity' },
        QuantityAfterTransfer: { type: DataTypes.FLOAT, field: 'QuantityAfterTransfer' },
        TransitQuantity: { type: DataTypes.FLOAT, field: 'TransitQuantity' },
        AcceptedQuantity: { type: DataTypes.FLOAT, field: 'AcceptedQuantity' },
        PurchaseUomId: { type: DataTypes.BIGINT, field: 'PurchaseUomId' },
        BaseUomId: { type: DataTypes.BIGINT, field: 'BaseUomId' },
        ConversionQuantity: { type: DataTypes.FLOAT, field: 'ConversionQuantity' },
        PurchasePrice: { type: DataTypes.DECIMAL, field: 'PurchasePrice' },
        DiscountModeId: { type: DataTypes.BIGINT, field: 'DiscountModeId' },
        DiscountAmount: { type: DataTypes.DECIMAL, field: 'DiscountAmount' },
        GstId: { type: DataTypes.BIGINT, field: 'GstId' },
        GstPercentage: { type: DataTypes.DECIMAL, field: 'GstPercentage' },
        GstAmount: { type: DataTypes.DECIMAL, field: 'GstAmount' },
        InGstId: { type: DataTypes.BIGINT, field: 'InGstId' },
        InGstPercentage: { type: DataTypes.DECIMAL, field: 'InGstPercentage' },
        InGstAmount: { type: DataTypes.DECIMAL, field: 'InGstAmount' },
        CGstId: { type: DataTypes.BIGINT, field: 'CGstId' },
        CGstPercentage: { type: DataTypes.DECIMAL, field: 'CGstPercentage' },
        CGstAmount: { type: DataTypes.DECIMAL, field: 'CGstAmount' },
        SGstId: { type: DataTypes.BIGINT, field: 'SGstId' },
        SGstPercentage: { type: DataTypes.DECIMAL, field: 'SGstPercentage' },
        SGstAmount: { type: DataTypes.DECIMAL, field: 'SGstAmount' },
        UnitCostPrice: { type: DataTypes.DECIMAL, field: 'UnitCostPrice' },
        MrPrice: { type: DataTypes.DECIMAL, field: 'MrPrice' },
        GrossAmount: { type: DataTypes.DECIMAL, field: 'GrossAmount' },
        NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        GrnId: { type: DataTypes.BIGINT, field: 'GrnId' },
        GrnDetailId: { type: DataTypes.BIGINT, field: 'GrnDetailId' },
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
            tableName: 'stocktransferdetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (StockTransferDetail as any).associate = function (models: Models) {
        StockTransferDetail.belongsTo(models.StockTransfer, { foreignKey: 'StockTransferId' });
        StockTransferDetail.belongsTo(models.StockItem, { foreignKey: 'StockItemId' });
        StockTransferDetail.belongsTo(models.StockSerialItem, { foreignKey: 'StockSerialItemId' });
        StockTransferDetail.belongsTo(models.ItemMaster, { foreignKey: 'ItemMasterId' });
    };

    return StockTransferDetail;
}


