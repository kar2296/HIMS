import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.OpticalGrnDetailInstance, i.OpticalGrnDetailAttributes> {
    let OpticalGrnDetail = sequelize.define<i.OpticalGrnDetailInstance, i.OpticalGrnDetailAttributes>('OpticalGrnDetail', {
        Id: { type: DataTypes.BIGINT, field: 'OpticalGrnDetailId', primaryKey: true, autoIncrement: true },
        OpticalGrnId: { type: DataTypes.BIGINT, field: 'OpticalGrnId' },
        VendorMasterId: { type: DataTypes.BIGINT, field: 'VendorMasterId' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        OpticalBarCodeId: { type: DataTypes.BIGINT, field: 'OpticalBarCodeId' },
        OpticalItemMasterId: { type: DataTypes.BIGINT, field: 'OpticalItemMasterId' },
        OpticalItemCode: { type: DataTypes.STRING, field: 'OpticalItemCode' },
        OpticalItemName: { type: DataTypes.STRING, field: 'OpticalItemName' },
        PoQuantity: { type: DataTypes.INTEGER, field: 'PoQuantity' },
        GrnQuantity: { type: DataTypes.INTEGER, field: 'GrnQuantity' },
        FreeQty: { type: DataTypes.INTEGER, field: 'FreeQty' },
        ManufacturedDate: { type: DataTypes.DATE, field: 'ManufacturedDate' },
        PurchaseUomId: { type: DataTypes.BIGINT, field: 'PurchaseUomId' },
        BaseUomId: { type: DataTypes.BIGINT, field: 'BaseUomId' },
        SaleUomId: { type: DataTypes.BIGINT, field: 'SaleUomId' },
        ConversionQuantity: { type: DataTypes.INTEGER, field: 'ConversionQuantity' },
        GrnQuantityAfterConversion: { type: DataTypes.INTEGER, field: 'GrnQuantityAfterConversion' },
        FreeQtyAfterConversion: { type: DataTypes.INTEGER, field: 'FreeQtyAfterConversion' },
        UomPrice: { type: DataTypes.DECIMAL, field: 'UomPrice' },
        PurchasePrice: { type: DataTypes.DECIMAL, field: 'PurchasePrice' },
        DiscountModeId: { type: DataTypes.BIGINT, field: 'DiscountModeId' },
        Discount: { type: DataTypes.DECIMAL, field: 'Discount' },
        UomDiscountAmount: { type: DataTypes.DECIMAL, field: 'UomDiscountAmount' },
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
        UomMRP: { type: DataTypes.DECIMAL, field: 'UomMRP' },
        MRP: { type: DataTypes.DECIMAL, field: 'MRP' },
        GrossAmount: { type: DataTypes.DECIMAL, field: 'GrossAmount' },
        NetAmountBeforeGst: { type: DataTypes.DECIMAL, field: 'NetAmountBeforeGst' },
        NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
        OpticalPurchaseOrderId: { type: DataTypes.BIGINT, field: 'OpticalPurchaseOrderId' },
        OpticalPurchaseOrderDetailId: { type: DataTypes.BIGINT, field: 'OpticalPurchaseOrderDetailId' },
        QtyBeforeGrn: { type: DataTypes.INTEGER, field: 'QtyBeforeGrn' },
        QtyAfterGrn: { type: DataTypes.INTEGER, field: 'QtyAfterGrn' },
        TotalQuantity: { type: DataTypes.INTEGER, field: 'TotalQuantity' },
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
            tableName: 'opticalgrndetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (OpticalGrnDetail as any).associate = function (models: Models) {
        OpticalGrnDetail.belongsTo(models.OpticalItemMaster, { foreignKey: 'OpticalItemMasterId' });
        OpticalGrnDetail.belongsTo(models.VendorMaster, { as: 'VendorMaster', foreignKey: 'VendorMasterId' });
        OpticalGrnDetail.belongsTo(models.StoreMaster, { as: 'StoreMaster', foreignKey: 'StoreMasterId' });
        OpticalGrnDetail.belongsTo(models.UomMaster, { as: 'PurchaseUom', foreignKey: 'PurchaseUomId' });
        OpticalGrnDetail.belongsTo(models.UomMaster, { as: 'BaseUom', foreignKey: 'BaseUomId' });
        OpticalGrnDetail.belongsTo(models.UomMaster, { as: 'SaleUom', foreignKey: 'SaleUomId' });
        OpticalGrnDetail.belongsTo(models.GstMaster, { as: 'GstMaster', foreignKey: 'GstId' });
        OpticalGrnDetail.belongsTo(models.GstMaster, { as: 'InGstMaster', foreignKey: 'InGstId' });
        OpticalGrnDetail.belongsTo(models.GstMaster, { as: 'CGstMaster', foreignKey: 'CGstId' });
        OpticalGrnDetail.belongsTo(models.GstMaster, { as: 'SGstMaster', foreignKey: 'SGstId' });
        OpticalGrnDetail.belongsTo(models.OpticalGrn, { as: 'OpticalGrn', foreignKey: 'OpticalGrnId' });
    };
    return OpticalGrnDetail;
}
