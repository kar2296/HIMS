import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ItemVendorMapInstance, i.ItemVendorMapAttributes> {
    let ItemVendorMap = sequelize.define<i.ItemVendorMapInstance, i.ItemVendorMapAttributes>('ItemVendorMap', {
        Id: { type: DataTypes.BIGINT, field: 'ItemVendorMapId', primaryKey: true, autoIncrement: true },
        ItemFacilityMapId: { type: DataTypes.BIGINT, field: 'ItemFacilityMapId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        ItemMasterId: { type: DataTypes.BIGINT, field: 'ItemMasterId' },
        CategoryId: { type: DataTypes.BIGINT, field: 'CategoryId' },
        VendorMasterId: { type: DataTypes.BIGINT, field: 'VendorMasterId' },
        ActiveStatusId: { type: DataTypes.BIGINT, field: 'ActiveStatusId' },
        FacilityCode: { type: DataTypes.STRING, field: 'FacilityCode' },
        ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
        VendorCode: { type: DataTypes.STRING, field: 'VendorCode' },
        FacilityName: { type: DataTypes.STRING, field: 'FacilityName' },
        ItemName: { type: DataTypes.STRING, field: 'ItemName' },
        VendorName: { type: DataTypes.STRING, field: 'VendorName' },
        LeadTime: { type: DataTypes.INTEGER, field: 'LeadTime' },
        CreditDays: { type: DataTypes.INTEGER, field: 'CreditDays' },
        ProductTypeId: { type: DataTypes.BIGINT, field: 'ProductTypeId' },
        PurchaseUomId: { type: DataTypes.BIGINT, field: 'PurchaseUomId' },
        PurchaseUomCode: { type: DataTypes.STRING, field: 'PurchaseUomCode' },
        ConversionQuantity: { type: DataTypes.INTEGER, field: 'ConversionQuantity' },
        SaleUomId: { type: DataTypes.BIGINT, field: 'SaleUomId' },
        SaleUomCode: { type: DataTypes.STRING, field: 'SaleUomCode' },
        RankId: { type: DataTypes.BIGINT, field: 'RankId' },
        ContactPerson: { type: DataTypes.STRING, field: 'ContactPerson' },
        ContactNumber: { type: DataTypes.STRING, field: 'ContactNumber' },
        MinQty: { type: DataTypes.INTEGER, field: 'MinQty' },
        MaxQty: { type: DataTypes.INTEGER, field: 'MaxQty' },
        FreeQty: { type: DataTypes.INTEGER, field: 'FreeQty' },
        UomPrice: { type: DataTypes.DECIMAL, field: 'UomPrice' },
        UomMrPrice: { type: DataTypes.DECIMAL, field: 'UomMrPrice' },
        Price: { type: DataTypes.DECIMAL, field: 'Price' },
        MrPrice: { type: DataTypes.DECIMAL, field: 'MrPrice' },
        DiscountModeId: { type: DataTypes.BIGINT, field: 'DiscountModeId' },
        DiscountModeCode: { type: DataTypes.STRING, field: 'DiscountModeCode' },
        Discount: { type: DataTypes.DECIMAL, field: 'Discount' },
        GstId: { type: DataTypes.BIGINT, field: 'GstId' },
        InGstId: { type: DataTypes.BIGINT, field: 'InGstId' },
        CGstId: { type: DataTypes.BIGINT, field: 'CGstId' },
        SGstId: { type: DataTypes.BIGINT, field: 'SGstId' },
        GstCode: { type: DataTypes.STRING, field: 'GstCode' },
        GstName: { type: DataTypes.STRING, field: 'GstName' },
        GstPercentage: { type: DataTypes.DECIMAL, field: 'GstPercentage' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
        ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'Createdby' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'Updatedby' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'itemvendormap',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (ItemVendorMap as any).associate = function (models: Models) {
        ItemVendorMap.belongsTo(models.ItemMaster, { foreignKey: 'ItemMasterId' });
        ItemVendorMap.belongsTo(models.ProductType, { foreignKey: 'ProductTypeId' });
        ItemVendorMap.belongsTo(models.VendorMaster, { foreignKey: 'VendorMasterId' });
        ItemVendorMap.belongsTo(models.UomMaster, { foreignKey: 'PurchaseUomId' });
        ItemVendorMap.belongsTo(models.UomMaster, { as: 'PurchaseUom', foreignKey: 'PurchaseUomId' });
        ItemVendorMap.belongsTo(models.UomMaster, { as: 'SaleUom', foreignKey: 'SaleUomId' });
        ItemVendorMap.belongsTo(models.GstMaster, { foreignKey: 'GstId' });
        ItemVendorMap.belongsTo(models.GstMaster, { as: 'InGstMaster', foreignKey: 'InGstId' });
        ItemVendorMap.belongsTo(models.GstMaster, { as: 'CGstMaster', foreignKey: 'CGstId' });
        ItemVendorMap.belongsTo(models.GstMaster, { as: 'SGstMaster', foreignKey: 'SGstId' });
        ItemVendorMap.belongsTo(models.ReferenceValue, { as: 'DiscountMode', targetKey: 'ReferenceValueCodeId' });
        ItemVendorMap.belongsTo(models.ReferenceValue, { as: 'Rank', targetKey: 'ReferenceValueCodeId' });
        ItemVendorMap.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return ItemVendorMap;
}
