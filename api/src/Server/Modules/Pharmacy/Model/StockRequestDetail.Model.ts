import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.StockRequestDetailInstance, i.StockRequestDetailAttributes> {
    let StockRequestDetail = sequelize.define<i.StockRequestDetailInstance, i.StockRequestDetailAttributes>('StockRequestDetail', {
        Id: { type: DataTypes.BIGINT, field: 'StockRequestDetailId', primaryKey: true, autoIncrement: true },
        StockTransferDetailId: { type: DataTypes.BIGINT, field: 'StockTransferDetailId' },
        StockRequestId: { type: DataTypes.BIGINT, field: 'StockRequestId' },
        ItemMasterId: { type: DataTypes.BIGINT, field: 'ItemMasterId' },
        ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
        ItemName: { type: DataTypes.STRING, field: 'ItemName' },
        QuantityOnHead: { type: DataTypes.FLOAT, field: 'QuantityOnHand' },
        QuantityOnHand: { type: DataTypes.FLOAT, field: 'QuantityOnHand' },
        RequestedQuantity: { type: DataTypes.FLOAT, field: 'RequestedQuantity' },
        TransferedQuantity: { type: DataTypes.FLOAT, field: 'TransferedQuantity' },
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
        GrossAmount: { type: DataTypes.DECIMAL, field: 'GrossAmount' },
        NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
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
            tableName: 'stockrequestdetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (StockRequestDetail as any).associate = function(models: Models) {
                    StockRequestDetail.belongsTo(models.UomMaster, { as: 'PurchaseUom', foreignKey: 'PurchaseUomId' });
                    StockRequestDetail.belongsTo(models.UomMaster, { as: 'BaseUom', foreignKey: 'BaseUomId' });
                    StockRequestDetail.belongsTo(models.GstMaster, { as: 'GstMaster', foreignKey: 'GstId' });
                    StockRequestDetail.belongsTo(models.ItemMaster, { foreignKey: 'ItemMasterId' });
                    StockRequestDetail.belongsTo(models.StockRequest, { foreignKey: 'StockRequestId' });
                    // StockRequestDetail.belongsTo(models.StockTransferDetail, { foreignKey: 'StockTransferDetailId' });
                    StockRequestDetail.hasMany(models.StockTransferDetail,
                        { as: 'StockTransferDetails',
                            foreignKey: 'StockRequestDetailId' });
                    //StockRequestDetail.belongsTo(models.StoreMaster, { as: 'FromStore',foreignKey: 'StoreMasterId' });
                };
 return StockRequestDetail;
}
