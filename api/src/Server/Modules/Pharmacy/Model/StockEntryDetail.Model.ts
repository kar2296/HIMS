import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.StockEntryDetailInstance, i.StockEntryDetailAttributes> {
    let StockEntryDetail = sequelize.define<i.StockEntryDetailInstance, i.StockEntryDetailAttributes>('StockEntryDetail', {
        Id: { type: DataTypes.BIGINT, field: 'StockEntryDetailId', primaryKey: true, autoIncrement: true },
        StockEntryId: { type: DataTypes.BIGINT, field: 'StockEntryId' },
        BarCodeId: { type: DataTypes.STRING, field: 'BarCodeId' },
        ItemMasterId: { type: DataTypes.BIGINT, field: 'ItemMasterId' },
        ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
        ItemName: { type: DataTypes.STRING, field: 'ItemName' },
        BatchId: { type: DataTypes.STRING, field: 'BatchId' },
        EntryQuantity: { type: DataTypes.FLOAT, field: 'EntryQuantity' },
        ExpiryDate: { type: DataTypes.DATE, field: 'ExpiryDate' },
        ManufacturedDate: { type: DataTypes.DATE, field: 'ManufacturedDate' },
        PurchaseUomId: { type: DataTypes.BIGINT, field: 'PurchaseUomId' },
        BaseUomId: { type: DataTypes.BIGINT, field: 'BaseUomId' },
        ConversionQuantity: { type: DataTypes.FLOAT, field: 'ConversionQuantity' },
        TotalConversionQuantity: { type: DataTypes.FLOAT, field: 'TotalConversionQuantity' },
        CurrencyId: { type: DataTypes.BIGINT, field: 'CurrencyId' },
        PurchasePrice: { type: DataTypes.DECIMAL, field: 'PurchasePrice' },
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
        Mrp: { type: DataTypes.DECIMAL, field: 'Mrp' },
        GrossAmount: { type: DataTypes.DECIMAL, field: 'GrossAmount' },
        NetAmountBeforeGst: { type: DataTypes.DECIMAL, field: 'NetAmountBeforeGst' },
        NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
        QtyBeforeEntry: { type: DataTypes.INTEGER, field: 'QtyBeforeEntry' },
        QtyAfterEntry: { type: DataTypes.INTEGER, field: 'QtyAfterEntry' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
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
            tableName: 'openingstockentrydetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (StockEntryDetail as any).associate = function (models: Models) {
        StockEntryDetail.belongsTo(models.UomMaster, { as: 'PurchaseUom', foreignKey: 'PurchaseUomId' });
        StockEntryDetail.belongsTo(models.UomMaster, { as: 'BaseUom', foreignKey: 'BaseUomId' });
        StockEntryDetail.belongsTo(models.StockEntry, { as: 'StockEntry', foreignKey: 'StockEntryId' });
        StockEntryDetail.belongsTo(models.ItemMaster, { as: 'ItemMaster', foreignKey: 'ItemMasterId' });
    };

    return StockEntryDetail;
}


