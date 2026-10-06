import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.StockAdjustmentDetailInstance, i.StockAdjustmentDetailAttributes> {
    let StockAdjustmentDetail = sequelize.define<i.StockAdjustmentDetailInstance, i.StockAdjustmentDetailAttributes>
        ('StockAdjustmentDetail', {
            Id: { type: DataTypes.BIGINT, field: 'StockAdjustmentDetailId', primaryKey: true, autoIncrement: true },
            StockAdjustmentId: { type: DataTypes.BIGINT, field: 'StockAdjustmentId' },
            StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
            ItemMasterId: { type: DataTypes.BIGINT, field: 'ItemMasterId' },
            ItemName: { type: DataTypes.STRING, field: 'ItemName' },
            ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
            BatchId: { type: DataTypes.INTEGER, field: 'BatchId' },
            BarcodeId: { type: DataTypes.INTEGER, field: 'BarcodeId' },
            AdjustedTypeId: { type: DataTypes.BIGINT, field: 'AdjustedTypeId' },
            ExpiryDate: { type: DataTypes.DATE, field: 'ExpiryDate' },
            ManufacturedDate: { type: DataTypes.BIGINT, field: 'ManufacturedDate' },
            TotalQtyBeforeAdj: { type: DataTypes.INTEGER, field: 'TotalQtyBeforeAdj' },
            BatchQtyBeforeAdj: { type: DataTypes.INTEGER, field: 'BatchQtyBeforeAdj' },
            QtyAdjusted: { type: DataTypes.DECIMAL, field: 'QtyAdjusted' },
            BatchQtyAfterAdj: { type: DataTypes.BIGINT, field: 'BatchQtyAfterAdj' },
            TotalQtyAfterAdj: { type: DataTypes.BIGINT, field: 'TotalQtyAfterAdj' },
            PurchaseUomId: { type: DataTypes.DECIMAL, field: 'PurchaseUomId' },
            BaseUomId: { type: DataTypes.BIGINT, field: 'BaseUomId' },
            PurchasePrice: { type: DataTypes.DECIMAL, field: 'PurchasePrice' },
            UnitCostPrice: { type: DataTypes.DECIMAL, field: 'UnitCostPrice' },
            MrPrice: { type: DataTypes.DECIMAL, field: 'MrPrice' },
            GrossAmount: { type: DataTypes.DECIMAL, field: 'GrossAmount' },
            NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
            StockSerialItemId: { type: DataTypes.DECIMAL, field: 'StockSerialItemId' },
            StockItemId: { type: DataTypes.DECIMAL, field: 'StockItemId' },
            Manufacture: { type: DataTypes.STRING, field: 'Manufacture' },
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
                tableName: 'stockadjustmentdetails',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (StockAdjustmentDetail as any).associate = function (models: Models) {
        StockAdjustmentDetail.belongsTo(models.StockAdjustment, { foreignKey: 'StockAdjustmentId' });
        StockAdjustmentDetail.belongsTo(models.ReferenceValue, {
            as: 'AdjustmentType', targetKey: 'ReferenceValueCodeId',
            foreignKey: 'AdjustedTypeId'
        });
        StockAdjustmentDetail.belongsTo(models.UomMaster, { as: 'PurchaseUom', foreignKey: 'PurchaseUomId' });
        StockAdjustmentDetail.belongsTo(models.UomMaster, { as: 'BaseUom', foreignKey: 'BaseUomId' });
        StockAdjustmentDetail.belongsTo(models.StoreMaster, { as: 'StoreMaster', foreignKey: 'StoreMasterId' });
    };
    return StockAdjustmentDetail;
}


