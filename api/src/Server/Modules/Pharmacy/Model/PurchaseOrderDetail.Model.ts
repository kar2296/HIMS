import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PurchaseOrderDetailInstance, i.PurchaseOrderDetailAttributes> {
    let PurchaseOrderDetail = sequelize.define<i.PurchaseOrderDetailInstance, i.PurchaseOrderDetailAttributes>('PurchaseOrderDetail', {
        Id: { type: DataTypes.BIGINT, field: 'PurchaseOrderDetailId', primaryKey: true, autoIncrement: true },
        PurchaseOrderId: { type: DataTypes.BIGINT, field: 'PurchaseOrderId' },
        ItemVendorMapId: { type: DataTypes.BIGINT, field: 'ItemVendorMapId' },
        VendorMasterId: { type: DataTypes.BIGINT, field: 'VendorMasterId' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        DeliveryStoreMasterId: { type: DataTypes.BIGINT, field: 'DeliveryStoreMasterId' },
        ItemFacilityMapId: { type: DataTypes.BIGINT, field: 'ItemFacilityMapId' },
        ItemMasterId: { type: DataTypes.BIGINT, field: 'ItemMasterId' },
        ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
        ItemName: { type: DataTypes.STRING, field: 'ItemName' },
        GenericId: { type: DataTypes.BIGINT, field: 'GenericId' },
        AvailableQuantity: { type: DataTypes.FLOAT, field: 'AvailableQuantity' },
        PoQuantity: { type: DataTypes.FLOAT, field: 'PoQuantity' },
        PrQuantity: { type: DataTypes.FLOAT, field: 'PrQuantity' },
        FreeQty: { type: DataTypes.FLOAT, field: 'FreeQty' },
        ReceivedQuantity: { type: DataTypes.FLOAT, field: 'ReceivedQuantity' },
        PurchaseUomId: { type: DataTypes.BIGINT, field: 'PurchaseUomId' },
        BaseUomId: { type: DataTypes.BIGINT, field: 'BaseUomId' },
        ConversionQuantity: { type: DataTypes.FLOAT, field: 'ConversionQuantity' },
        TotalQuantity: { type: DataTypes.FLOAT, field: 'TotalQuantity' },
        TotalQuantityAfterConversion: { type: DataTypes.FLOAT, field: 'TotalQuantityAfterConversion' },
        UomPrice: { type: DataTypes.DECIMAL, field: 'UomPrice' },
        PurchasePrice: { type: DataTypes.DECIMAL, field: 'PurchasePrice' },
        DiscountModeId: { type: DataTypes.BIGINT, field: 'DiscountModeId' },
        Discount: { type: DataTypes.DECIMAL, field: 'Discount' },
        DiscountMode1Id: { type: DataTypes.BIGINT, field: 'DiscountMode1Id' },
        Discount1: { type: DataTypes.DECIMAL, field: 'Discount1' },
        DiscountMode2Id: { type: DataTypes.BIGINT, field: 'DiscountMode2Id' },
        Discount2: { type: DataTypes.DECIMAL, field: 'Discount2' },
        UomDiscountAmount: { type: DataTypes.DECIMAL, field: 'UomDiscountAmount' },
        UomDiscount1Amount: { type: DataTypes.DECIMAL, field: 'UomDiscount1Amount' },
        UomDiscount2Amount: { type: DataTypes.DECIMAL, field: 'UomDiscount2Amount' },
        DiscountAmount: { type: DataTypes.DECIMAL, field: 'DiscountAmount' },
        UomPriceAfterDiscount: { type: DataTypes.DECIMAL, field: 'UomPriceAfterDiscount' },
        PurchasePriceAfterDiscount: { type: DataTypes.DECIMAL, field: 'PurchasePriceAfterDiscount' },
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
        UomCostPrice: { type: DataTypes.DECIMAL, field: 'UomCostPrice' },
        UnitCostPrice: { type: DataTypes.DECIMAL, field: 'UnitCostPrice' },
        UomMrPrice: { type: DataTypes.DECIMAL, field: 'UomMrPrice' },
        MrPrice: { type: DataTypes.DECIMAL, field: 'MrPrice' },
        Mrp: { type: DataTypes.DECIMAL, field: 'Mrp' },
        GrossAmount: { type: DataTypes.DECIMAL, field: 'GrossAmount' },
        NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
        SaleAmount: { type: DataTypes.DECIMAL, field: 'SaleAmount' },
        ProfitAmount: { type: DataTypes.DECIMAL, field: 'ProfitAmount' },
        PurchaseRequestDetailId: { type: DataTypes.BIGINT, field: 'PurchaseRequestDetailId' },
        BatchExpiryDate: { type: DataTypes.DATE, field: 'BatchExpiryDate' },
        BatchId: { type: DataTypes.STRING, field: 'BatchId' },
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
            tableName: 'purchaseorderdetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PurchaseOrderDetail as any).associate = function (models: Models) {
        PurchaseOrderDetail.belongsTo(models.ItemMaster, { foreignKey: 'ItemMasterId' });
        PurchaseOrderDetail.belongsTo(models.VendorMaster, { foreignKey: 'VendorMasterId' });
        PurchaseOrderDetail.belongsTo(models.UomMaster, { as: 'PurchaseUom', foreignKey: 'PurchaseUomId' });
        PurchaseOrderDetail.belongsTo(models.UomMaster, { as: 'BaseUom', foreignKey: 'BaseUomId' });
        PurchaseOrderDetail.belongsTo(models.GstMaster, { as: 'GstMaster', foreignKey: 'GstId' });
        PurchaseOrderDetail.belongsTo(models.GstMaster, { as: 'InGstMaster', foreignKey: 'InGstId' });
        PurchaseOrderDetail.belongsTo(models.GstMaster, { as: 'CGstMaster', foreignKey: 'CGstId' });
        PurchaseOrderDetail.belongsTo(models.GstMaster, { as: 'SGstMaster', foreignKey: 'SGstId' });
        PurchaseOrderDetail.belongsTo(models.ItemVendorMap, { as: 'VendorItem', foreignKey: 'VendorMasterId' });
        PurchaseOrderDetail.belongsTo(models.StoreMaster, { as: 'RequestedStore', foreignKey: 'StoreMasterId' });
        PurchaseOrderDetail.belongsTo(models.StoreMaster, { as: 'DeliveryStore', foreignKey: 'DeliveryStoreMasterId' });
        PurchaseOrderDetail.belongsTo(models.PurchaseOrder, { as: 'PurchaseOrder', foreignKey: 'PurchaseOrderId' });
    };

    return PurchaseOrderDetail;
}


