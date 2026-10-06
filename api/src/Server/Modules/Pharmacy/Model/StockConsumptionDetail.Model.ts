import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.StockConsumptionDetailInstance, i.StockConsumptionDetailAttributes> {
    let StockConsumptionDetail = sequelize.define<i.StockConsumptionDetailInstance, i.StockConsumptionDetailAttributes>
        ('StockConsumptionDetail', {
            Id: { type: DataTypes.BIGINT, field: 'StockConsumptionDetailId', primaryKey: true, autoIncrement: true },
            StockConsumptionId: { type: DataTypes.BIGINT, field: 'StockConsumptionId' },
            ConsumptionTypeId: { type: DataTypes.BIGINT, field: 'ConsumptionTypeId' },
            StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
            ItemMasterId: { type: DataTypes.BIGINT, field: 'ItemMasterId' },
            ItemName: { type: DataTypes.STRING, field: 'ItemName' },
            ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
            BatchId: { type: DataTypes.STRING, field: 'BatchId' },
            BarCodeId: { type: DataTypes.STRING, field: 'BarCodeId' },
            ExpiryDate: { type: DataTypes.DATE, field: 'ExpiryDate' },
            ManufacturedDate: { type: DataTypes.DATE, field: 'ManufacturedDate' },
            Manufacture: { type: DataTypes.STRING, field: 'Manufacture' },
            QtyBeforeConsumption: { type: DataTypes.INTEGER, field: 'QtyBeforeConsumption' },
            QtyConsumed: { type: DataTypes.INTEGER, field: 'QtyConsumed' },
            QtyAfterConsumption: { type: DataTypes.INTEGER, field: 'QtyAfterConsumption' },
            QtyBeforeAdjustment: { type: DataTypes.INTEGER, field: 'QtyBeforeAdjustment' },
            QtyAdjusted: { type: DataTypes.INTEGER, field: 'QtyAdjusted' },
            QtyAfterAdjusted: { type: DataTypes.INTEGER, field: 'QtyAfterAdjusted' },
            PurchaseUomId: { type: DataTypes.BIGINT, field: 'PurchaseUomId' },
            BaseUomId: { type: DataTypes.BIGINT, field: 'BaseUomId' },
            PurchasePrice: { type: DataTypes.DECIMAL, field: 'PurchasePrice' },
            UnitCostPrice: { type: DataTypes.DECIMAL, field: 'UnitCostPrice' },
            MrPrice: { type: DataTypes.DECIMAL, field: 'MrPrice' },
            GrossAmount: { type: DataTypes.DECIMAL, field: 'GrossAmount' },
            NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
            StockSerialItemId: { type: DataTypes.BIGINT, field: 'StockSerialItemId' },
            StockItemId: { type: DataTypes.DECIMAL, field: 'StockItemId' },
            Comments: { type: DataTypes.STRING, field: 'Comments' },
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        },
        {
            indexes: [],
            timestamps: true,
            tableName: 'stockconsumptiondetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (StockConsumptionDetail as any).associate = function (models: Models) {
        StockConsumptionDetail.belongsTo(models.UomMaster, { as: 'PurchaseUom', foreignKey: 'PurchaseUomId' });
        StockConsumptionDetail.belongsTo(models.UomMaster, { as: 'BaseUom', foreignKey: 'BaseUomId' });
		StockConsumptionDetail.belongsTo(models.StoreMaster, { as: 'ConsumedStore', foreignKey: 'StoreMasterId' });
        StockConsumptionDetail.belongsTo(models.StockConsumption, { as: 'StockConsumption', foreignKey: 'StockConsumptionId' });
    };

    return StockConsumptionDetail;
}
