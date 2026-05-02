import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.GrnDetailInstance, i.GrnDetailAttributes> {
    let GrnDetail = sequelize.define<i.GrnDetailInstance, i.GrnDetailAttributes>('GrnDetail', {
        Id: { type: DataTypes.BIGINT, field: 'GrnDetailId', primaryKey: true, autoIncrement: true },
        GrnId: { type: DataTypes.BIGINT, field: 'GrnId' },
        ItemVendorMapId: { type: DataTypes.BIGINT, field: 'ItemVendorMapId' },
        VendorMasterId: { type: DataTypes.BIGINT, field: 'VendorMasterId' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        BarCodeId: { type: DataTypes.BIGINT, field: 'BarCodeId' },
        ItemFacilityMapId: { type: DataTypes.BIGINT, field: 'ItemFacilityMapId' },
        ItemMasterId: { type: DataTypes.BIGINT, field: 'ItemMasterId' },
        ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
        ItemName: { type: DataTypes.STRING, field: 'ItemName' },
        IsMultiUse: { type: DataTypes.BOOLEAN, field: 'IsMultiUse' },
        NoOfTransactions: { type: DataTypes.STRING, field: 'NoOfTransactions' },
        BatchId: { type: DataTypes.STRING, field: 'BatchId' },
        PoQuantity: { type: DataTypes.FLOAT, field: 'PoQuantity' },
        GrnQuantity: { type: DataTypes.FLOAT, field: 'GrnQuantity' },
        FreeQty: { type: DataTypes.FLOAT, field: 'FreeQty' },
        ExpiryDate: { type: DataTypes.DATE, field: 'ExpiryDate' },
        ManufacturedDate: { type: DataTypes.DATE, field: 'ManufacturedDate' },
        PurchaseUomId: { type: DataTypes.BIGINT, field: 'PurchaseUomId' },
        BaseUomId: { type: DataTypes.BIGINT, field: 'BaseUomId' },
        SaleUomId: { type: DataTypes.BIGINT, field: 'SaleUomId' },
        ConversionQuantity: { type: DataTypes.INTEGER, field: 'ConversionQuantity' },
        GrnQuantityAfterConversion: { type: DataTypes.FLOAT, field: 'GrnQuantityAfterConversion' },
        FreeQtyAfterConversion: { type: DataTypes.INTEGER, field: 'FreeQtyAfterConversion' },
        CurrencyId: { type: DataTypes.BIGINT, field: 'CurrencyId' },
        UomPrice: { type: DataTypes.DECIMAL, field: 'UomPrice' },
        PurchasePrice: { type: DataTypes.DECIMAL, field: 'PurchasePrice' },
        DiscountMode1Id: { type: DataTypes.BIGINT, field: 'DiscountMode1Id' },
        Discount: { type: DataTypes.DECIMAL, field: 'Discount' },
        DiscountModeId: { type: DataTypes.BIGINT, field: 'DiscountModeId' },
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
        NetAmountBeforeGst: { type: DataTypes.DECIMAL, field: 'NetAmountBeforeGst' },
        NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
        PurchaseOrderId: { type: DataTypes.BIGINT, field: 'PurchaseOrderId' },
        PurchaseOrderDetailId: { type: DataTypes.BIGINT, field: 'PurchaseOrderDetailId' },
        QtyBeforeGrn: { type: DataTypes.INTEGER, field: 'QtyBeforeGrn' },
        QtyAfterGrn: { type: DataTypes.INTEGER, field: 'QtyAfterGrn' },
        TotalQuantity: { type: DataTypes.FLOAT, field: 'TotalQuantity' },
        TotalQuantityAfterConversion: { type: DataTypes.FLOAT, field: 'TotalQuantityAfterConversion' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        TaxableAmount: { type: DataTypes.INTEGER, field: 'TaxableAmount' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'grndetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (GrnDetail as any).associate = function (models: Models) {
        GrnDetail.belongsTo(models.ItemMaster, { foreignKey: 'ItemMasterId' });
        GrnDetail.belongsTo(models.VendorMaster, { as: 'VendorMaster', foreignKey: 'VendorMasterId' });
        GrnDetail.belongsTo(models.StoreMaster, { as: 'StoreMaster', foreignKey: 'StoreMasterId' });
        GrnDetail.belongsTo(models.UomMaster, { as: 'PurchaseUom', foreignKey: 'PurchaseUomId' });
        GrnDetail.belongsTo(models.UomMaster, { as: 'BaseUom', foreignKey: 'BaseUomId' });
        GrnDetail.belongsTo(models.UomMaster, { as: 'SaleUom', foreignKey: 'SaleUomId' });
        GrnDetail.belongsTo(models.GstMaster, { as: 'GstMaster', foreignKey: 'GstId' });
        GrnDetail.belongsTo(models.GstMaster, { as: 'InGstMaster', foreignKey: 'InGstId' });
        GrnDetail.belongsTo(models.GstMaster, { as: 'CGstMaster', foreignKey: 'CGstId' });
        GrnDetail.belongsTo(models.GstMaster, { as: 'SGstMaster', foreignKey: 'SGstId' });
        GrnDetail.belongsTo(models.ItemVendorMap, { as: 'VendorItem', foreignKey: 'VendorMasterId' });
        GrnDetail.belongsTo(models.Grn, { foreignKey: 'GrnId' });
        GrnDetail.belongsTo(models.PurchaseOrderDetail, { as: 'PurchaseOrderDetail', foreignKey: 'PurchaseOrderDetailId' });
        GrnDetail.belongsTo(models.PurchaseOrder, { as: 'PurchaseOrder', foreignKey: 'PurchaseOrderId' });
        GrnDetail.hasMany(models.StockSerialItem);
    };

    return GrnDetail;
}


