import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PurchaseReturnDetailInstance, i.PurchaseReturnDetailAttributes> {
    let PurchaseReturnDetail = sequelize.define<i.PurchaseReturnDetailInstance, i.PurchaseReturnDetailAttributes>('PurchaseReturnDetail', {
        PurchaseReturnDetailId: { type: DataTypes.BIGINT, field: 'PurchaseReturnDetailId', primaryKey: true, autoIncrement: true },
        PurchaseReturnId: { type: DataTypes.BIGINT, field: 'PurchaseReturnId' },
        PrnTypeId: { type: DataTypes.BIGINT, field: 'PrnTypeId' },
        ReturnReasonId: { type: DataTypes.BIGINT, field: 'ReturnReasonId' },
        VendorMasterId: { type: DataTypes.BIGINT, field: 'VendorMasterId' },
        StockItemId: { type: DataTypes.BIGINT, field: 'StockItemId' },
        StockSerialItemId: { type: DataTypes.BIGINT, field: 'StockSerialItemId' },
        BarCodeId: { type: DataTypes.STRING, field: 'BarCodeId' },
        ItemMasterId: { type: DataTypes.BIGINT, field: 'ItemMasterId' },
        ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
        ItemName: { type: DataTypes.STRING, field: 'ItemName' },
        BatchId: { type: DataTypes.STRING, field: 'BatchId' },
        PoQuantity: { type: DataTypes.DECIMAL, field: 'PoQuantity' },
        GrnQuantity: { type: DataTypes.DECIMAL, field: 'GrnQuantity' },
        FreeQty: { type: DataTypes.DECIMAL, field: 'FreeQty' },
        PrnQuantity: { type: DataTypes.DECIMAL, field: 'PrnQuantity' },
        ExpiryDate: { type: DataTypes.DATE, field: 'ExpiryDate' },
        ManufacturedDate: { type: DataTypes.DATE, field: 'ManufacturedDate' },
        PurchaseOrderDetailId: { type: DataTypes.BIGINT, field: 'PurchaseOrderDetailId' },
        GrnDetailId: { type: DataTypes.BIGINT, field: 'GrnDetailId' },
        PurchaseUomId: { type: DataTypes.INTEGER, field: 'PurchaseUomId' },
        BaseUomId: { type: DataTypes.INTEGER, field: 'BaseUomId' },
        SaleUomId: { type: DataTypes.INTEGER, field: 'SaleUomId' },
        ConversionQuantity: { type: DataTypes.DECIMAL, field: 'ConversionQuantity' },
        CurrencyId: { type: DataTypes.INTEGER, field: 'CurrencyId' },
        UomPrice: { type: DataTypes.DECIMAL, field: 'UomPrice' },
        PurchasePrice: { type: DataTypes.DECIMAL, field: 'PurchasePrice' },
        GrossAmount: { type: DataTypes.DECIMAL, field: 'GrossAmount' },
        DiscountModeId: { type: DataTypes.BIGINT, field: 'DiscountModeId' },
        Discount: { type: DataTypes.DECIMAL, field: 'Discount' },
        DiscountAmount: { type: DataTypes.DECIMAL, field: 'DiscountAmount' },
        UomDiscountAmount: { type: DataTypes.DECIMAL, field: 'UomDiscountAmount' },
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
        NetAmountBeforeGst: { type: DataTypes.DECIMAL, field: 'NetAmountBeforeGst' },
        NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
        QtyBeforeReturn: { type: DataTypes.DECIMAL, field: 'QtyBeforeReturn' },
        QtyAfterReturn: { type: DataTypes.DECIMAL, field: 'QtyAfterReturn' },
        TotalQuantity: { type: DataTypes.INTEGER, field: 'TotalQuantity' },
        TotalQuantityAfterConversion: { type: DataTypes.INTEGER, field: 'TotalQuantityAfterConversion' },
        ReturnQty: { type: DataTypes.INTEGER, field: 'ReturnQty' },
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
            tableName: 'purchasereturndetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PurchaseReturnDetail as any).associate = function (models: Models) {
        PurchaseReturnDetail.belongsTo(models.UomMaster, { as: 'PurchaseUom', foreignKey: 'PurchaseUomId' });
        PurchaseReturnDetail.belongsTo(models.ItemMaster, { foreignKey: 'ItemMasterId' });
        PurchaseReturnDetail.belongsTo(models.Grn, { foreignKey: 'GrnDetailId' });
        PurchaseReturnDetail.belongsTo(models.StockItem, { foreignKey: 'StockItemId' });
        PurchaseReturnDetail.belongsTo(models.StockSerialItem, { foreignKey: 'StockSerialItemId' });
        PurchaseReturnDetail.belongsTo(models.UomMaster, { as: 'BaseUom', foreignKey: 'BaseUomId' });
        PurchaseReturnDetail.belongsTo(models.ItemVendorMap, { as: 'VendorItem', foreignKey: 'VendorMasterId' });
        PurchaseReturnDetail.belongsTo(models.PurchaseReturn, { foreignKey: 'PurchaseReturnId' });
        PurchaseReturnDetail.belongsTo(models.GstMaster, { as: 'GstMaster', foreignKey: 'GstId' });
        PurchaseReturnDetail.belongsTo(models.GstMaster, { as: 'InGstMaster', foreignKey: 'InGstId' });
        PurchaseReturnDetail.belongsTo(models.GstMaster, { as: 'CGstMaster', foreignKey: 'CGstId' });
        PurchaseReturnDetail.belongsTo(models.GstMaster, { as: 'SGstMaster', foreignKey: 'SGstId' });
    };

    return PurchaseReturnDetail;
}
