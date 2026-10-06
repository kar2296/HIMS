import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PurchaseRequestDetailInstance, i.PurchaseRequestDetailAttributes> {
    let PurchaseRequestDetail = sequelize.define<i.PurchaseRequestDetailInstance,
        i.PurchaseRequestDetailAttributes>('PurchaseRequestDetail', {
            Id: { type: DataTypes.BIGINT, field: 'PurchaseRequestDetailId', primaryKey: true, autoIncrement: true },
            PurchaseRequestId: { type: DataTypes.BIGINT, field: 'PurchaseRequestId' },
            VendorMasterId: { type: DataTypes.BIGINT, field: 'VendorMasterId' },
            StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
            ToStoreMasterId: { type: DataTypes.BIGINT, field: 'ToStoreMasterId' },
            ItemMasterId: { type: DataTypes.BIGINT, field: 'ItemMasterId' },
            ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
            ItemName: { type: DataTypes.STRING, field: 'ItemName' },
            QuantityOnHand: { type: DataTypes.INTEGER, field: 'QuantityOnHand' },
            StockInHand: { type: DataTypes.INTEGER, field: 'StockInHand' },
            RequestedQuantity: { type: DataTypes.INTEGER, field: 'RequestedQuantity' },
            FreeQty: { type: DataTypes.INTEGER, field: 'FreeQty' },
            PurchaseUomId: { type: DataTypes.BIGINT, field: 'PurchaseUomId' },
            BaseUomId: { type: DataTypes.BIGINT, field: 'BaseUomId' },
            ConversionQuantity: { type: DataTypes.INTEGER, field: 'ConversionQuantity' },
            PurchasePrice: { type: DataTypes.DECIMAL, field: 'PurchasePrice' },
            DiscountModeId: { type: DataTypes.BIGINT, field: 'DiscountModeId' },
            Discount: { type: DataTypes.DECIMAL, field: 'Discount' },
            DiscountAmount: { type: DataTypes.DECIMAL, field: 'DiscountAmount' },
            PurchasePriceAfterDiscount: { type: DataTypes.DECIMAL, field: 'PurchasePriceAfterDiscount' },
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
            PurchaseOrderDetailId: { type: DataTypes.BIGINT, field: 'PurchaseOrderDetailId' },
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
            tableName: 'purchaserequestdetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PurchaseRequestDetail as any).associate = function (models: Models) {
        PurchaseRequestDetail.belongsTo(models.UomMaster, { as: 'PurchaseUom', foreignKey: 'PurchaseUomId' });
        PurchaseRequestDetail.belongsTo(models.UomMaster, { as: 'BaseUom', foreignKey: 'BaseUomId' });
        PurchaseRequestDetail.belongsTo(models.GstMaster, { as: 'GstMaster', foreignKey: 'GstId' });
        PurchaseRequestDetail.belongsTo(models.GstMaster, { as: 'InGstMaster', foreignKey: 'InGstId' });
        PurchaseRequestDetail.belongsTo(models.GstMaster, { as: 'CGstMaster', foreignKey: 'CGstId' });
        PurchaseRequestDetail.belongsTo(models.GstMaster, { as: 'SGstMaster', foreignKey: 'SGstId' });
        PurchaseRequestDetail.belongsTo(models.VendorMaster, { as: 'VendorMaster', foreignKey: 'VendorMasterId' });
        PurchaseRequestDetail.belongsTo(models.StoreMaster, { as: 'FromStore', foreignKey: 'StoreMasterId' });
        PurchaseRequestDetail.belongsTo(models.StoreMaster, { as: 'ToStore', foreignKey: 'ToStoreMasterId' });
        PurchaseRequestDetail.belongsTo(models.ItemVendorMap, {
            as: 'VendorItem',
            foreignKey: 'VendorMasterId'
        });
        PurchaseRequestDetail.belongsTo(models.PurchaseRequest, { as: 'PurchaseRequest', foreignKey: 'PurchaseRequestId' });
    };

    return PurchaseRequestDetail;
}


