import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.StockSerialMovementInstance, i.StockSerialMovementAttributes> {
    let StockSerialMovement = sequelize.define<i.StockSerialMovementInstance, i.StockSerialMovementAttributes>('StockSerialMovement', {
        Id: { type: DataTypes.BIGINT, field: 'StockSerialMovementId', primaryKey: true, autoIncrement: true },
        StockMovementId: { type: DataTypes.BIGINT, field: 'StockMovementId' },
        TransactionDetailId: { type: DataTypes.BIGINT, field: 'TransactionDetailId' },
        StockSerialItemId: { type: DataTypes.BIGINT, field: 'StockSerialItemId' },
        TransactionDate: { type: DataTypes.DATE, field: 'TransactionDate' },
        BarCodeId: { type: DataTypes.STRING, field: 'BarCodeId' },
        ItemMasterId: { type: DataTypes.BIGINT, field: 'ItemMasterId' },
        BatchId: { type: DataTypes.STRING, field: 'BatchId' },
        ExpiryDate: { type: DataTypes.DATE, field: 'ExpiryDate' },
        TotalBFQty: { type: DataTypes.FLOAT, field: 'TotalBFQty' },
        InQty: { type: DataTypes.FLOAT, field: 'InQty' },
        OutQty: { type: DataTypes.FLOAT, field: 'OutQty' },
        TotalAFQty: { type: DataTypes.FLOAT, field: 'TotalAFQty' },
        Ucp: { type: DataTypes.DECIMAL, field: 'Ucp' },
        Mrp: { type: DataTypes.DECIMAL, field: 'Mrp' },
        ConversionMrp: { type: DataTypes.DECIMAL, field: 'ConversionMrp' },
        IsMultiUse: { type: DataTypes.BOOLEAN, field: 'IsMultiUse' },
        TotalTransactions: { type: DataTypes.STRING, field: 'TotalTransactions' },
        ConsumedTransactions: { type: DataTypes.STRING, field: 'ConsumedTransactions' },
        PendingTransactions: { type: DataTypes.STRING, field: 'PendingTransactions' },
        GstId: { type: DataTypes.BIGINT, field: 'GstId' },
        GstPercentage: { type: DataTypes.DECIMAL, field: 'GstPercentage' },
        InGstId: { type: DataTypes.BIGINT, field: 'InGstId' },
        InGstPercentage: { type: DataTypes.DECIMAL, field: 'InGstPercentage' },
        CGstId: { type: DataTypes.BIGINT, field: 'CGstId' },
        CGstPercentage: { type: DataTypes.DECIMAL, field: 'CGstPercentage' },
        SGstId: { type: DataTypes.BIGINT, field: 'SGstId' },
        SGstPercentage: { type: DataTypes.DECIMAL, field: 'SGstPercentage' },
        PurchaseUomId: { type: DataTypes.INTEGER, field: 'PurchaseUomId' },
        BaseUomId: { type: DataTypes.INTEGER, field: 'BaseUomId' },
        SaleUomId: { type: DataTypes.INTEGER, field: 'SaleUomId' },
        ManufacturerId: { type: DataTypes.BIGINT, field: 'ManufacturerId' },
        VendorMasterId: { type: DataTypes.BIGINT, field: 'VendorMasterId' },
        GrnDetailId: { type: DataTypes.BIGINT, field: 'GrnDetailId' },
        GrnId: { type: DataTypes.BIGINT, field: 'GrnId' },
        StockEntryDetailId: { type: DataTypes.BIGINT, field: 'StockEntryDetailId' },
        StockEntryId: { type: DataTypes.BIGINT, field: 'StockEntryId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
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
            tableName: 'stockserialmovements',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });
    (StockSerialMovement as any).associate = function (models: Models) {
        StockSerialMovement.belongsTo(models.ItemMaster, { foreignKey: 'ItemMasterId' });
        StockSerialMovement.belongsTo(models.StockMovement, { foreignKey: 'StockMovementId' });
        StockSerialMovement.belongsTo(models.StockSerialItem, { foreignKey: 'StockSerialItemId' });
    };


    return StockSerialMovement;
}
